import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PubSubClient, PubSubMessage } from '@app/pubsub-sdk';
import { OpaClient } from '@app/opa-client';
import { McpClient } from '@app/mcp-sdk';
import {
  PropertyLifecycleEvent,
  PropertyLifecycleAction,
  ReasoningSnapshot,
} from '@app/common-types';
import { McpCheckResult } from '@app/mcp-sdk';

@Injectable()
export class MasterAiService implements OnModuleInit {
  private readonly logger = new Logger(MasterAiService.name);
  private readonly snapshots: ReasoningSnapshot[] = [];
  private readonly subscriptionName = process.env.PROPERTY_EVENTS_SUBSCRIPTION;

  constructor(
    private readonly pubSubClient: PubSubClient,
    private readonly opaClient: OpaClient,
    private readonly mcpClient: McpClient,
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

    const checks = await this.runCrossChecks(event);
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

    const actionResult = await this.mcpClient.executeMinistryAction(
      'property',
      event.action,
      { propertyId: event.propertyId, payload: event.payload },
    );

    if (!actionResult.success) {
      snapshot.details = `Action failed: ${actionResult.details}`;
      this.snapshots.push(snapshot);
      this.logger.error('Failed to execute ministry action', actionResult.details);
      return snapshot;
    }

    snapshot.decision = 'approved';
    snapshot.details = actionResult.details;
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

  private async runCrossChecks(event: PropertyLifecycleEvent): Promise<McpCheckResult[]> {
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
}
