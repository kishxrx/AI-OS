import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PubSubClient, PubSubMessage } from '@app/pubsub-sdk';
import { OpaClient } from '@app/opa-client';
import { McpClient } from '@app/mcp-sdk';
import {
  MasterAiPlan,
  PropertyLifecycleEvent,
  PropertyLifecycleAction,
  ReasoningSnapshot,
} from '@app/common-types';
import { McpActionResult, McpCheckResult } from '@app/mcp-sdk';
import { MasterAiClient } from './master-ai.client';

@Injectable()
export class MasterAiService implements OnModuleInit {
  private readonly logger = new Logger(MasterAiService.name);
  private readonly snapshots: ReasoningSnapshot[] = [];
  private readonly subscriptionName = process.env.PROPERTY_EVENTS_SUBSCRIPTION;

  constructor(
    private readonly pubSubClient: PubSubClient,
    private readonly opaClient: OpaClient,
    private readonly mcpClient: McpClient,
    private readonly masterAiClient: MasterAiClient,
  ) {}

  onModuleInit(): void {
    if (!this.subscriptionName) {
      this.logger.warn('PROPERTY_EVENTS_SUBSCRIPTION is not configured. Pub/Sub listener disabled.');
      return;
    }

    this.pubSubClient.subscribe(this.subscriptionName, (message) => {
      this.handleMessage(message).catch((error) =>
        this.logger.error('Failed to process Pub/Sub message', error),
      );
    });
  }

  async handleMessage(message: PubSubMessage): Promise<void> {
    try {
      const event = JSON.parse(message.data.toString()) as PropertyLifecycleEvent;
      await this.processLifecycleEvent(event);
    } catch (error) {
      this.logger.error('Invalid Pub/Sub payload', error as Error);
    } finally {
      message.ack();
    }
  }

  async processLifecycleEvent(event: PropertyLifecycleEvent): Promise<ReasoningSnapshot> {
    const rule = this.ruleForAction(event.action);
    const snapshot: ReasoningSnapshot = {
      eventId: event.eventId,
      action: event.action,
      propertyId: event.propertyId,
      allowedByPolicy: false,
      checkResults: [],
      decision: 'rejected',
      timestamp: new Date().toISOString(),
    };

    const opaResult = await this.opaClient.evaluate(rule, {
      user: event.user,
      action: event.action,
      data: event.payload,
    });

    snapshot.allowedByPolicy = opaResult.allowed;
    snapshot.policyReason = opaResult.reason;

    if (!opaResult.allowed) {
      snapshot.details = 'OPA denied the action.';
      this.snapshots.push(snapshot);
      this.logger.warn(`OPA rejected ${event.action} for ${event.propertyId}`);
      return snapshot;
    }

    const plan = await this.masterAiClient.createPlan(event);
    snapshot.plan = plan;

    const checks = await this.runCrossChecks(event, plan);
    snapshot.checkResults = checks.map((check) => ({
      ministry: check.ministry,
      cleared: check.cleared,
      details: check.details,
    }));

    if (!checks.every((check) => check.cleared)) {
      snapshot.details = 'One or more ministries flagged issues.';
      this.snapshots.push(snapshot);
      this.logger.warn(
        `Master AI rejected ${event.action} for ${event.propertyId} after ministry checks`,
      );
      return snapshot;
    }

    const executionResults = await this.executePlanActions(event, plan);
    const failedResult = executionResults.find((result) => !result.success);

    if (failedResult) {
      snapshot.details = `Action failed: ${failedResult.details}`;
      this.snapshots.push(snapshot);
      this.logger.error('Failed to execute ministry action', failedResult.details);
      return snapshot;
    }

    snapshot.decision = 'approved';
    snapshot.details = executionResults.map((result) => result.details).join(' | ');
    this.snapshots.push(snapshot);
    this.logger.log(`Master AI approved ${event.action} for ${event.propertyId}`);
    return snapshot;
  }

  listSnapshotHistory(): ReasoningSnapshot[] {
    return [...this.snapshots];
  }

  private ruleForAction(action: PropertyLifecycleAction): string {
    switch (action) {
      case 'create_property':
        return 'allow_create';
      case 'logical_delete_property':
        return 'allow_logical_delete';
      case 'hard_delete_property':
        return 'allow_hard_delete';
    }
  }

  private async runCrossChecks(
    event: PropertyLifecycleEvent,
    plan: MasterAiPlan,
  ): Promise<McpCheckResult[]> {
    const checkActions = plan.actions.filter((action) => action.type === 'check');
    if (checkActions.length > 0) {
      return await Promise.all(
        checkActions.map((action) =>
          this.mcpClient.askMinistry(action.ministry, action.task, {
            propertyId: event.propertyId,
            payload: event.payload,
            reason: action.reason,
          }),
        ),
      );
    }

    return this.runDefaultCrossChecks(event);
  }

  private async runDefaultCrossChecks(event: PropertyLifecycleEvent): Promise<McpCheckResult[]> {
    if (event.action === 'create_property') {
      return [
        await this.mcpClient.askMinistry('property', 'duplicate-check', {
          propertyId: event.propertyId,
          payload: event.payload,
        }),
      ];
    }

    return await Promise.all([
      this.mcpClient.askMinistry('property', 'tenant-check', {
        propertyId: event.propertyId,
      }),
      this.mcpClient.askMinistry('finance', 'balance-check', {
        propertyId: event.propertyId,
      }),
      this.mcpClient.askMinistry('legal', 'hold-check', {
        propertyId: event.propertyId,
      }),
    ]);
  }

  private async executePlanActions(
    event: PropertyLifecycleEvent,
    plan: MasterAiPlan,
  ): Promise<McpActionResult[]> {
    const executeActions = plan.actions.filter((action) => action.type !== 'check');
    const payload = {
      propertyId: event.propertyId,
      payload: event.payload,
    };

    if (executeActions.length === 0) {
      return [await this.mcpClient.executeMinistryAction('property', event.action, payload)];
    }

    return await Promise.all(
      executeActions.map((action) =>
        this.mcpClient.executeMinistryAction(action.ministry, action.task, {
          ...payload,
          reason: action.reason,
        }),
      ),
    );
  }
}
