import { Logger } from '@nestjs/common';

export type Ministry = 'property' | 'finance' | 'legal';

export interface McpCheckResult {
  ministry: Ministry;
  cleared: boolean;
  details: string;
}

export interface McpActionResult {
  success: boolean;
  details: string;
}

export class McpClient {
  private readonly logger = new Logger(McpClient.name);
  private readonly endpoints: Record<Ministry, string | undefined>;

  constructor(endpoints?: Partial<Record<Ministry, string>>) {
    this.endpoints = {
      property: endpoints?.property || process.env.MCP_ENDPOINT_PROPERTY,
      finance: endpoints?.finance || process.env.MCP_ENDPOINT_FINANCE,
      legal: endpoints?.legal || process.env.MCP_ENDPOINT_LEGAL,
    };
  }

  async askMinistry(ministry: Ministry, action: string, payload: unknown): Promise<McpCheckResult> {
    const endpoint = this.endpoints[ministry];
    if (!endpoint) {
      const details = `No endpoint configured for ${ministry}; defaulting to clear.`;
      this.logger.warn(details);
      return { ministry, cleared: true, details };
    }

    try {
      const response = await fetch(`${endpoint}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-MCP-Phase': 'check' },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));
      const cleared = response.ok && (body.cleared ?? true);
      const details = body.details ?? `HTTP ${response.status}`;
      return { ministry, cleared, details };
    } catch (error) {
      const message = (error as Error).message;
      this.logger.error(`MCP check failed for ${ministry}: ${message}`);
      return { ministry, cleared: false, details: message };
    }
  }

  async executeMinistryAction(ministry: Ministry, action: string, payload: unknown): Promise<McpActionResult> {
    const endpoint = this.endpoints[ministry];
    if (!endpoint) {
      const details = `No endpoint configured for ${ministry}; skipping action ${action}`;
      this.logger.warn(details);
      return { success: false, details };
    }

    try {
      const response = await fetch(`${endpoint}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-MCP-Phase': 'execute' },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));
      const success = response.ok;
      const details = body.details ?? `HTTP ${response.status}`;
      return { success, details };
    } catch (error) {
      const message = (error as Error).message;
      this.logger.error(`MCP action failed for ${ministry}: ${message}`);
      return { success: false, details: message };
    }
  }
}
