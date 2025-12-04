import { strict as assert } from 'node:assert';
import {
  MasterAiService,
} from '../services/master-ai/src/master-ai.service';
import {
  PropertyLifecycleAction,
  PropertyLifecycleEvent,
} from '@app/common-types';
import { McpCheckResult } from '@app/mcp-sdk';

interface TestSetupOptions {
  opaAllowed?: boolean;
  opaReason?: string;
  crossChecks?: McpCheckResult[];
  actionSuccess?: boolean;
  actionDetails?: string;
}

const defaultCrossChecks: McpCheckResult[] = [
  { ministry: 'property', cleared: true, details: 'OK' },
  { ministry: 'finance', cleared: true, details: 'OK' },
  { ministry: 'legal', cleared: true, details: 'OK' },
];

function makeEvent(action: PropertyLifecycleAction): PropertyLifecycleEvent {
  return {
    eventId: `evt-${action}`,
    action,
    propertyId: 'prop-123',
    user: { id: 'user-1', role: 'tester', permissions: ['property:create'] },
    payload: { foo: 'bar' },
  };
}

function createTestService(options: TestSetupOptions = {}): MasterAiService {
  const crossChecksQueue = [...(options.crossChecks ?? [])];
  const pubSubStub = { subscribe: () => undefined };
  const opaClient = {
    evaluate: async () => ({
      allowed: options.opaAllowed ?? true,
      reason: options.opaReason,
    }),
  };
  const mcpClient = {
    askMinistry: async () => {
      const next = crossChecksQueue.shift();
      if (!next) {
        throw new Error('No cross-check response configured');
      }
      return next;
    },
    executeMinistryAction: async () => ({
      success: options.actionSuccess ?? true,
      details: options.actionDetails ?? 'executed',
    }),
  };

  return new MasterAiService(
    pubSubStub as any,
    opaClient as any,
    mcpClient as any,
  );
}

async function testOpaRejection(): Promise<void> {
  const service = createTestService({
    opaAllowed: false,
    opaReason: 'policy denies it',
  });
  const snapshot = await service.processLifecycleEvent(makeEvent('create_property'));
  assert.strictEqual(snapshot.allowedByPolicy, false);
  assert.strictEqual(snapshot.decision, 'rejected');
  assert.strictEqual(snapshot.policyReason, 'policy denies it');
  assert.ok(snapshot.details?.includes('OPA denied'));
  assert.strictEqual(service.listSnapshotHistory().length, 1);
}

async function testCrossCheckFailure(): Promise<void> {
  const crossChecks: McpCheckResult[] = [
    { ministry: 'property', cleared: true, details: 'ok' },
    { ministry: 'finance', cleared: false, details: 'insufficient funds' },
    { ministry: 'legal', cleared: true, details: 'ok' },
  ];
  const service = createTestService({ crossChecks });
  const snapshot = await service.processLifecycleEvent(makeEvent('logical_delete_property'));
  assert.strictEqual(snapshot.allowedByPolicy, true);
  assert.strictEqual(snapshot.decision, 'rejected');
  assert.ok(snapshot.details?.includes('ministries flagged'));
  assert.strictEqual(service.listSnapshotHistory().length, 1);
}

async function testApprovalPath(): Promise<void> {
  const service = createTestService({
    crossChecks: defaultCrossChecks,
    actionSuccess: true,
    actionDetails: 'action completed successfully',
  });
  const snapshot = await service.processLifecycleEvent(makeEvent('hard_delete_property'));
  assert.strictEqual(snapshot.allowedByPolicy, true);
  assert.strictEqual(snapshot.decision, 'approved');
  assert.strictEqual(snapshot.details, 'action completed successfully');
  assert.strictEqual(service.listSnapshotHistory().length, 1);
}

async function runTests(): Promise<void> {
  await testOpaRejection();
  await testCrossCheckFailure();
  await testApprovalPath();
  console.log('Master AI smoke tests passed');
}

void runTests().catch((error) => {
  console.error('Master AI smoke tests failed', error);
  process.exit(1);
});
