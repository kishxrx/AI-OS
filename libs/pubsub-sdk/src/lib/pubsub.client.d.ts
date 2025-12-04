export interface PubSubMessage {
    data: Buffer;
    ack: () => void;
}
export type PubSubHandler = (message: PubSubMessage) => void;
export declare class PubSubClient {
    private readonly logger;
    private readonly handlers;
    /**
     * Registers a subscription handler. The handler can be triggered manually via
     * `simulateMessage` for testing or local development.
     */
    subscribe(subscriptionName: string, handler: PubSubHandler): void;
    /**
     * Publishes a message to the given subscription (in reality, this would be backed
     * by Google Pub/Sub). Here it immediately invokes the handler for testing/demo.
     */
    publish(subscriptionName: string, payload: unknown): void;
    /**
     * Manually inject a message (payload is already JSON) for tests or one-off checks.
     */
    simulateMessage(subscriptionName: string, rawPayload: string | Buffer): void;
}
//# sourceMappingURL=pubsub.client.d.ts.map