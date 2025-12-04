import { Logger } from '@nestjs/common';

export interface OpaEvaluationResult {
  allowed: boolean;
  reason?: string;
}

export class OpaClient {
  private readonly logger = new Logger(OpaClient.name);
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.OPA_URL || 'http://localhost:8181';
  }

  async evaluate(rule: string, input: unknown): Promise<OpaEvaluationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/data/property/lifecycle/${rule}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`OPA returned ${response.status}: ${text}`);
      }

      const payload = await response.json();
      const allowed = Boolean(payload.result);

      this.logger.debug(
        `OPA rule ${rule} returned ${allowed} (raw: ${JSON.stringify(payload.result)})`,
      );

      return { allowed };
    } catch (error) {
      this.logger.error('OPA evaluation failed', error as Error);
      return { allowed: false, reason: (error as Error).message };
    }
  }
}
