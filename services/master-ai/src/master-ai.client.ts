import { Injectable, Logger } from '@nestjs/common';
import { MasterAiAction, MasterAiPlan, PropertyLifecycleEvent } from '@app/common-types';

@Injectable()
export class MasterAiClient {
  private readonly logger = new Logger(MasterAiClient.name);
  private readonly apiKey: string | undefined;
  private readonly apiUrl: string;
  private readonly modelName: string;

  constructor() {
    this.apiKey = process.env.MASTER_AI_API_KEY || process.env.AI_MODEL_API_KEY;
    this.apiUrl =
      process.env.MASTER_AI_API_URL ||
      process.env.AI_MODEL_API_URL ||
      'https://api.openai.com/v1/chat/completions';
    this.modelName = process.env.MASTER_AI_MODEL_NAME || 'gpt-4.1-mini';
  }

  async createPlan(event: PropertyLifecycleEvent): Promise<MasterAiPlan> {
    if (!this.apiKey) {
      this.logger.warn('Master AI API key not configured; returning default plan.');
      return this.buildDefaultPlan(event, 'no API key configured');
    }

    const messages = [
      {
        role: 'system',
        content:
          'You are the Cabinet Secretary AI. Your job is to design lawful automation plans by reading events, understanding the constitution (OPA rules), and deciding which ministries to query and command.',
      },
      {
        role: 'user',
        content: `Event details:\n${JSON.stringify(event, null, 2)}\n\nReturn only JSON with this shape: { "narrative": "...", "actions": [ { "ministry": "property|finance|legal", "task": "string", "type": "check|execute", "reason": "why", } ] }. Use "check" to represent pre-flight questions and "execute" for final commands.`,
      },
    ];

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`OpenAI ${response.status} - ${body}`);
      }

      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI response did not include a message.');
      }

      const parsed = JSON.parse(content.trim()) as MasterAiPlan;
      return this.normalizePlan(parsed);
    } catch (error) {
      const message = (error as Error).message;
      this.logger.error('Failed to generate Master AI plan; using default.', message);
      return this.buildDefaultPlan(event, message);
    }
  }

  private normalizePlan(plan: MasterAiPlan): MasterAiPlan {
    return {
      narrative: plan.narrative ?? 'No narrative provided',
      actions: (plan.actions ?? []).map((action) => ({
        ...action,
        type: action.type ?? 'execute',
      })),
    };
  }

  private buildDefaultPlan(event: PropertyLifecycleEvent, reason?: string): MasterAiPlan {
    const narrative = reason
      ? `Default plan triggered (${reason})`
      : 'Default plan (AI not available)';
    return {
      narrative,
      actions: [
        {
          ministry: 'property',
          task: 'duplicate-check',
          type: 'check',
          reason: 'Ensure property uniqueness.',
        },
        {
          ministry: 'finance',
          task: 'balance-check',
          type: 'check',
          reason: 'Ensure outstanding balance is zero.',
        },
        {
          ministry: 'legal',
          task: 'hold-check',
          type: 'check',
          reason: 'Ensure no legal holds exist.',
        },
        {
          ministry: 'property',
          task: event.action,
          type: 'execute',
          reason: 'Default property lifecycle task.',
        },
      ],
    };
  }
}
