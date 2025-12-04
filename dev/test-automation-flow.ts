import { strict as assert } from 'node:assert';
import { MasterAiService } from '../services/master-ai/src/master-ai.service';
import { PropertyAiService } from '../services/property-ai/src/property-ai.service';
import { PubSubClient } from '@app/pubsub-sdk';
import {
  McpActionResult,
  McpCheckResult,
  McpClient,
  Ministry,
} from '@app/mcp-sdk';
import { OpaClient } from '@app/opa-client';
import {
  CreatePropertyDto,
  IPropertyRepository,
  MaintenanceAnalysisDto,
  PropertyDto,
  PropertyStatus,
  UnitStatus,
} from '@app/common-types';
import { AiModelClient } from '../services/property-ai/src/agent/ai-model.client';
import { MasterAiClient } from '../services/master-ai/src/master-ai.client';
import { createServer } from 'node:http';

interface InMemoryPropertyRecord extends PropertyDto {}

class InMemoryPropertyRepository implements IPropertyRepository {
  private readonly store = new Map<string, InMemoryPropertyRecord>();

  async create(property: CreatePropertyDto): Promise<PropertyDto> {
    const id = `prop-${Math.random().toString(36).slice(2, 8)}`;
    const record: PropertyDto = {
      ...property,
      id,
    };
    this.store.set(id, record);
    return record;
  }

  async findById(id: string): Promise<PropertyDto | null> {
    return this.store.get(id) ?? null;
  }

  async findByName(name: string): Promise<PropertyDto[]> {
    return Array.from(this.store.values()).filter((property) => property.name === name);
  }

  async findAll(): Promise<PropertyDto[]> {
    return Array.from(this.store.values());
  }

  async update(id: string, property: Partial<PropertyDto>): Promise<PropertyDto> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Property ${id} not found`);
    }
    const updated = { ...existing, ...property }; // allow patch semantics
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async logicalDelete(id: string): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Property ${id} not found for logical delete`);
    }
    this.store.set(id, { ...existing, status: PropertyStatus.LOGICALLY_DELETED });
  }
}

class DummyUnitRepository {
  async create(): Promise<void> {
    return;
  }

  async findByPropertyId(): Promise<{ id: string; status: UnitStatus }[]> {
    return [];
  }

  async findById(): Promise<null> {
    return null;
  }

  async findAll(): Promise<[] /* unused */> {
    return [];
  }

  async update(): Promise<void> {
    return;
  }

  async delete(): Promise<void> {
    return;
  }

  async logicalDelete(): Promise<void> {
    return;
  }
}

class StubOpaClient extends OpaClient {
  async evaluate(): Promise<{ allowed: boolean; reason?: string }> {
    return { allowed: true, reason: 'stub allows everything' };
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForSnapshot(
  masterService: MasterAiService,
  timeoutMs = 10000,
  pollIntervalMs = 200,
) {
  const start = Date.now();
  return new Promise<void>((resolve, reject) => {
    const check = () => {
      if (masterService.listSnapshotHistory().length > 0) {
        resolve();
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        reject(new Error('Timed out waiting for Master AI snapshots'));
        return;
      }
      setTimeout(check, pollIntervalMs);
    };

    check();
  });
}

type MinistryInvocation = {
  action: string;
  payload: unknown;
  type: 'check' | 'execute';
};

function startMinistryServer(ministry: Ministry, port: number) {
  const invocations: MinistryInvocation[] = [];

  const server = createServer((req: any, res: any) => {
    if (req.method !== 'POST') {
      res.writeHead(405);
      res.end();
      return;
    }

    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const action = req.url?.replace(/^\//, '') ?? 'unknown';
      const payload = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : undefined;
      const invocationType: MinistryInvocation['type'] =
        req.headers['x-mcp-phase'] === 'check' ? 'check' : 'execute';
      invocations.push({ action, payload, type: invocationType });

      const response = {
        ministry,
        cleared: true,
        success: true,
        details: `Simulated ${invocationType} for ${ministry}.${action}`,
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    });
  });

  server.listen(port);
  return { server, port, invocations, ministry };
}

async function runAutomationFlow(): Promise<void> {
  const servers = [
    startMinistryServer('property', 4301),
    startMinistryServer('finance', 4302),
    startMinistryServer('legal', 4303),
  ];

  process.env.MCP_ENDPOINT_PROPERTY = `http://localhost:${servers[0].port}`;
  process.env.MCP_ENDPOINT_FINANCE = `http://localhost:${servers[1].port}`;
  process.env.MCP_ENDPOINT_LEGAL = `http://localhost:${servers[2].port}`;

  const propertyRepo = new InMemoryPropertyRepository();
  const unitRepo = new DummyUnitRepository() as any;

  const pubSub = new PubSubClient();
  process.env.PROPERTY_EVENTS_SUBSCRIPTION = 'property-events';

  const masterService = new MasterAiService(
    pubSub,
    new StubOpaClient(),
    new McpClient(),
    new MasterAiClient(),
  );
  masterService.onModuleInit();

  const sampleProperty: CreatePropertyDto = {
    name: 'Sunrise Residences',
    type: 'Apartment',
    ownerId: 'owner-42',
    address: {
      state: 'Karnataka',
      pincode: '560001',
      addressLine1: '100 Sample Street',
      city: 'Bangalore',
      country: 'India',
    },
    status: PropertyStatus.ACTIVE,
  };

  try {
    const propertyService = new PropertyAiService(propertyRepo, unitRepo, pubSub);
    const createdProperty = await propertyService.createProperty(sampleProperty);
    console.log('Property created in test store:', createdProperty.id);

    const aiClient = new AiModelClient();
    const exampleRequest = 'The sink in unit 12B is leaking, water is pooling and the faucet is stuck.';
    const aiAnalysis: MaintenanceAnalysisDto = await aiClient.analyzeMaintenanceRequest(exampleRequest);
    console.log('AI analysis output:', aiAnalysis);

    await waitForSnapshot(masterService);
    const history = masterService.listSnapshotHistory();
    console.log('Master AI snapshot history length:', history.length);
    assert(history.length === 1, 'Expected exactly one reasoning snapshot');
    assert.strictEqual(history[0].decision, 'approved');
    console.log('Automation flow validated a complete event → Master AI cycle.');
  } finally {
    servers.forEach(({ server, ministry, invocations }) => {
      server.close();
      console.log(`MCP server for ${ministry} processed ${invocations.length} calls.`, invocations);
    });
  }
}

runAutomationFlow()
  .then(() => console.log('End-to-end automation simulation succeeded.'))
  .catch((error) => {
    console.error('Automation simulation failed', error);
    process.exit(1);
  });
