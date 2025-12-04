"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubClient = void 0;
var common_1 = require("@nestjs/common");
var PubSubClient = /** @class */ (function () {
    function PubSubClient() {
        this.logger = new common_1.Logger(PubSubClient.name);
        this.handlers = new Map();
    }
    /**
     * Registers a subscription handler. The handler can be triggered manually via
     * `simulateMessage` for testing or local development.
     */
    PubSubClient.prototype.subscribe = function (subscriptionName, handler) {
        this.handlers.set(subscriptionName, handler);
        this.logger.log("Subscribed to ".concat(subscriptionName));
    };
    /**
     * Publishes a message to the given subscription (in reality, this would be backed
     * by Google Pub/Sub). Here it immediately invokes the handler for testing/demo.
     */
    PubSubClient.prototype.publish = function (subscriptionName, payload) {
        var _this = this;
        var handler = this.handlers.get(subscriptionName);
        if (!handler) {
            this.logger.warn("No handler registered for subscription ".concat(subscriptionName));
            return;
        }
        var message = {
            data: Buffer.from(JSON.stringify(payload)),
            ack: function () { return _this.logger.log("Message acknowledged for ".concat(subscriptionName)); },
        };
        handler(message);
    };
    /**
     * Manually inject a message (payload is already JSON) for tests or one-off checks.
     */
    PubSubClient.prototype.simulateMessage = function (subscriptionName, rawPayload) {
        var _this = this;
        var handler = this.handlers.get(subscriptionName);
        if (!handler) {
            this.logger.warn("No handler to simulate for ".concat(subscriptionName));
            return;
        }
        var message = {
            data: Buffer.isBuffer(rawPayload) ? rawPayload : Buffer.from(rawPayload),
            ack: function () { return _this.logger.log("Simulated message acked for ".concat(subscriptionName)); },
        };
        handler(message);
    };
    return PubSubClient;
}());
exports.PubSubClient = PubSubClient;
