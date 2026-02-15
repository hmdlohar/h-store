const { PostHog } = require("posthog-node");
const config = require("../config");

class PostHogService {
  constructor() {
    if (!PostHogService.instance) {
      this.client = null;
      this.init();
      PostHogService.instance = this;
    }
    return PostHogService.instance;
  }

  init() {
    if (config.POSTHOG_KEY) {
      this.client = new PostHog(config.POSTHOG_KEY, {
        host: config.POSTHOG_HOST || "https://us.i.posthog.com",
      });
      console.log("PostHog backend initialized");
    } else {
      console.warn("PostHog key not configured, backend tracking disabled");
    }
  }

  capture(event, properties = {}, distinctId = null) {
    if (!this.client) return;

    const eventData = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        source: "backend",
      },
    };

    if (distinctId) {
      eventData.distinctId = distinctId;
    }

    this.client.capture(eventData);
  }

  identify(distinctId, properties = {}) {
    if (!this.client || !distinctId) return;

    this.client.identify({
      distinctId,
      properties: {
        ...properties,
        backend_identified: true,
      },
    });
  }

  trackOrderEvent(orderId, event, properties = {}) {
    this.capture(event, {
      ...properties,
      order_id: orderId,
      category: "order",
    });
  }

  trackUserEvent(userId, event, properties = {}) {
    this.capture(event, properties, userId);
  }

  trackProductEvent(productId, event, properties = {}) {
    this.capture(event, {
      ...properties,
      product_id: productId,
      category: "product",
    });
  }

  trackError(error, context = {}) {
    this.capture("backend_error", {
      error_message: error.message,
      error_name: error.name,
      error_stack: error.stack,
      ...context,
      category: "error",
    });
  }

  shutdown() {
    if (this.client) {
      this.client.shutdown();
    }
  }
}

const postHogService = new PostHogService();
module.exports = postHogService;
