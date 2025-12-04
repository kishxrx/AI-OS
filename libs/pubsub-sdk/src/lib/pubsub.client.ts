import { Logger } from '@nestjs/common';

export interface PubSubMessage {
  data: Buffer;
  ack: () => void;
}

export type PubSubHandler = (message: PubSubMessage) => void;

export class PubSubClient {
  private readonly logger = new Logger(PubSubClient.name);
  private readonly handlers = new Map<string, PubSubHandler>();

  /**
   * Registers a subscription handler. The handler can be triggered manually via
   * `simulateMessage` for testing or local development.
   */
  subscribe(subscriptionName: string, handler: PubSubHandler): void {
    this.handlers.set(subscriptionName, handler);
    this.logger.log(`Subscribed to ${subscriptionName}`);
  }

  /**
   * Publishes a message to the given subscription (in reality, this would be backed
   * by Google Pub/Sub). Here it immediately invokes the handler for testing/demo.
   */
  publish(subscriptionName: string, payload: unknown): void {
    const handler = this.handlers.get(subscriptionName);
    if (!handler) {
      this.logger.warn(`No handler registered for subscription ${subscriptionName}`);
      return;
    }

    const message: PubSubMessage = {
      data: Buffer.from(JSON.stringify(payload)),
      ack: () => this.logger.log(`Message acknowledged for ${subscriptionName}`),
    };

    handler(message);
  }

  /**
   * Manually inject a message (payload is already JSON) for tests or one-off checks.
   */
  simulateMessage(subscriptionName: string, rawPayload: string | Buffer): void {
    const handler = this.handlers.get(subscriptionName);
    if (!handler) {
      this.logger.warn(`No handler to simulate for ${subscriptionName}`);
      return;
    }

    const message: PubSubMessage = {
      data: Buffer.isBuffer(rawPayload) ? rawPayload : Buffer.from(rawPayload),
      ack: () => this.logger.log(`Simulated message acked for ${subscriptionName}`),
    };

    handler(message);
  }
}
