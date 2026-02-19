const axios = require("axios");

class ConversionsApiService {
  constructor() {
    this.pixelId = process.env.FACEBOOK_PIXEL_ID || "3168601370008522";
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    this.apiVersion = "v18.0";
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  async sendEvent(eventData, clientIp, userAgent) {
    if (!this.accessToken) {
      console.warn("Facebook Access Token not configured");
      return;
    }

    const url = `${this.baseUrl}/${this.pixelId}/events`;

    // Build user data for matching
    const userData = this.buildUserData(eventData, clientIp, userAgent);

    // Build the event payload
    const payload = {
      data: [
        {
          event_name: eventData.eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventData.eventId,
          action_source: "website",
          event_source_url: eventData.url,
          user_data: userData,
          custom_data: this.buildCustomData(eventData.params),
        },
      ],
      access_token: this.accessToken,
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });
      
      return response.data;
    } catch (error) {
      console.error("Conversions API Error:", error.response?.data || error.message);
      throw error;
    }
  }

  buildUserData(eventData, clientIp, userAgent) {
    const userData = {};

    // Add IP address (hashed automatically by Meta if not already hashed)
    if (clientIp) {
      userData.client_ip_address = clientIp;
    }

    // Add user agent
    if (userAgent) {
      userData.client_user_agent = userAgent;
    }

    // Add fbp cookie if available (from browser pixel)
    if (eventData.fbp) {
      userData.fbp = eventData.fbp;
    }

    // Add external ID if user is logged in
    if (eventData.userId) {
      userData.external_id = this.hashData(eventData.userId.toString());
    }

    // Add email if available
    if (eventData.email) {
      userData.em = this.hashData(eventData.email.toLowerCase().trim());
    }

    // Add phone if available
    if (eventData.phone) {
      userData.ph = this.hashData(eventData.phone.replace(/\D/g, ""));
    }

    return userData;
  }

  buildCustomData(params) {
    const customData = {};

    // Currency
    if (params.currency) {
      customData.currency = params.currency;
    }

    // Value/Amount
    if (params.value !== undefined) {
      customData.value = params.value;
    }

    // Content IDs
    if (params.content_ids) {
      customData.content_ids = Array.isArray(params.content_ids) 
        ? params.content_ids 
        : [params.content_ids];
    }

    // Content Name
    if (params.content_name) {
      customData.content_name = params.content_name;
    }

    // Content Type
    if (params.content_type) {
      customData.content_type = params.content_type;
    }

    // Contents (for multiple products)
    if (params.contents) {
      customData.contents = params.contents;
    }

    // Number of items
    if (params.num_items) {
      customData.num_items = params.num_items;
    }

    // Order ID
    if (params.order_id) {
      customData.order_id = params.order_id;
    }

    // Predicted LTV
    if (params.predicted_ltv) {
      customData.predicted_ltv = params.predicted_ltv;
    }

    // Status
    if (params.status) {
      customData.status = params.status;
    }

    return customData;
  }

  hashData(data) {
    // For now, return as-is - Facebook will hash it server-side
    // In production, you should hash sensitive data using SHA256
    return data;
  }
}

module.exports = new ConversionsApiService();
