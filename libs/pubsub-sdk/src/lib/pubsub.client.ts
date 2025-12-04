import { Logger } from '@nestjs/common';
import { ClientConfig, PubSub, Subscription, Message } from '@google-cloud/pubsub';

export interface PubSubMessage {
  data: Buffer;
  ack: () => void;
}

export type PubSubHandler = (message: PubSubMessage) => void | Promise<void>;

export class PubSubClient {
  private readonly logger = new Logger(PubSubClient.name);
  private readonly handlers = new Map<string, PubSubHandler>();
  private readonly googlePubSub?: PubSub;
  private readonly useRealPubSub: boolean;

  constructor() {
    this.useRealPubSub = process.env.USE_GCP_PUBSUB === 'true';
    if (this.useRealPubSub) {
      const projectId =
        process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCP_PROJECT ?? process.env.GCLOUD_PROJECT;
      const clientConfig: ClientConfig = projectId
        ? ({ projectId } as ClientConfig)
        : {};
      this.googlePubSub = new PubSub(clientConfig);
    }
  }

  /**
   * Registers a subscription handler.
   */
  subscribe(subscriptionName: string, handler: PubSubHandler): void {
    if (this.useRealPubSub && this.googlePubSub) {
      const subscription: Subscription = this.googlePubSub.subscription(subscriptionName);
      subscription.on('message', (message: Message) => {
        handler({
          data: message.data,
          ack: () => message.ack(),
        });
      });

      subscription.on('error', (error) => {
        this.logger.error(`Pub/Sub subscription error for ${subscriptionName}`, error);
      });

      this.logger.log(`Subscribed to ${subscriptionName}`);
      return;
    }

    this.handlers.set(subscriptionName, handler);
    this.logger.log(`Subscribed to ${subscriptionName}`);
  }

  /**
   * Publishes to a topic/backchannel.
   */
  async publish(topicName: string, payload: unknown): Promise<string | void> {
    if (this.useRealPubSub && this.googlePubSub) {
      const topic = this.googlePubSub.topic(topicName);
      const messageId = await topic.publishMessage({
        json: payload,
      });
      this.logger.log(`Published message ${messageId} to ${topicName}`);
      return messageId;
    }

    const handler = this.handlers.get(topicName);
    if (!handler) {
      this.logger.warn(`No handler registered for subscription ${topicName}`);
      return;
    }

    const message: PubSubMessage = {
      data: Buffer.from(JSON.stringify(payload)),
      ack: () => this.logger.log(`Message acknowledged for ${topicName}`),
    };

    await handler(message);
  }

  /**
   * Manually inject a message for tests.
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

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handler(message);
  }
}
