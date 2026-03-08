const axios = require("axios");
const { parseErrorString } = require("hyper-utils");
const MessageLogModel = require("../models/MessageLogModel");

class WhatsAppDeliveryService {
  static getEnv(name, fallback = "") {
    return process.env[name] || process.env[name.toLowerCase()] || fallback;
  }

  static getConfig() {
    return {
      baseUrl: this.getEnv("WWEBJS_API_BASE_URL", ""),
      apiKey: this.getEnv("WWEBJS_API_KEY", ""),
      sessionId: this.getEnv("WWEBJS_SESSION_ID", ""),
      defaultCountryCode: this.getEnv("WHATSAPP_DEFAULT_COUNTRY_CODE", "91"),
      timeoutMs: Number(this.getEnv("WWEBJS_API_TIMEOUT_MS", "15000")) || 15000,
    };
  }

  static isProxyEnabled() {
    const explicit = this.getEnv("MESSAGE_PROXY_ENABLED", "");
    if (explicit) {
      return explicit === "1" || explicit.toLowerCase() === "true";
    }
    return this.getEnv("NODE_ENV", "development") !== "production";
  }

  static getEffectiveRecipient(originalTo) {
    if (!this.isProxyEnabled()) {
      return { to: originalTo, proxied: false };
    }
    const proxyWhatsApp = this.getEnv("MESSAGE_PROXY_WHATSAPP", "").trim();
    if (!proxyWhatsApp) {
      return { to: originalTo, proxied: false };
    }
    return { to: proxyWhatsApp, proxied: true };
  }

  static normalizeChatId(to) {
    if (!to) {
      throw new Error("WhatsApp recipient is required");
    }

    const value = String(to).trim();
    if (!value) {
      throw new Error("WhatsApp recipient is required");
    }

    if (value.endsWith("@c.us") || value.endsWith("@g.us")) {
      return value;
    }

    let digits = value.replace(/\D/g, "");
    if (!digits) {
      throw new Error(`Invalid WhatsApp recipient: ${value}`);
    }

    if (digits.startsWith("00")) {
      digits = digits.slice(2);
    }

    const { defaultCountryCode } = this.getConfig();
    if (digits.length === 10) {
      digits = `${defaultCountryCode}${digits}`;
    }

    return `${digits}@c.us`;
  }

  static getEndpoint() {
    const { baseUrl, sessionId } = this.getConfig();
    if (!baseUrl) {
      throw new Error("WWEBJS_API_BASE_URL is required");
    }
    if (!sessionId) {
      throw new Error("WWEBJS_SESSION_ID is required");
    }
    return `${baseUrl.replace(/\/+$/, "")}/client/sendMessage/${encodeURIComponent(sessionId)}`;
  }

  static getHeaders() {
    const { apiKey } = this.getConfig();
    if (!apiKey) {
      throw new Error("WWEBJS_API_KEY is required");
    }
    return {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    };
  }

  static async sendViaWWebJS({ to, content }) {
    const chatId = this.normalizeChatId(to);
    const text = String(content || "").trim();
    if (!text) {
      throw new Error("WhatsApp message content is required");
    }

    const payload = {
      chatId,
      contentType: "string",
      content: text,
    };

    const { timeoutMs } = this.getConfig();
    const response = await axios.post(this.getEndpoint(), payload, {
      headers: this.getHeaders(),
      timeout: timeoutMs,
    });

    return {
      provider: "wwebjs-api",
      chatId,
      providerResponse: response?.data || {},
    };
  }

  static async processPendingWhatsAppLogs(limit = 5) {
    const logs = await MessageLogModel.find({ type: "whatsapp", status: "pending" })
      .sort({ createdAt: 1 })
      .limit(limit);

    if (!logs.length) return { scanned: 0, sent: 0, failed: 0 };

    let sent = 0;
    let failed = 0;

    for (const log of logs) {
      const [error] = await this.processWhatsAppLog(log);
      if (error) {
        failed++;
      } else {
        sent++;
      }
    }

    return { scanned: logs.length, sent, failed };
  }

  static async processWhatsAppLog(log) {
    try {
      const recipient = this.getEffectiveRecipient(log.to);
      const providerResponse = await this.sendViaWWebJS({
        to: recipient.to,
        content: log.content || "",
      });

      await MessageLogModel.updateOne(
        { _id: log._id },
        {
          $set: {
            status: "sent",
            error: "",
            info: {
              ...(log.info || {}),
              provider: providerResponse.provider,
              chatId: providerResponse.chatId,
              providerResponse: providerResponse.providerResponse,
              originalTo: log.to,
              actualTo: recipient.to,
              isProxied: recipient.proxied,
            },
          },
        },
      );
      return [null, true];
    } catch (error) {
      const parsedError = parseErrorString(error);
      const responseData = error?.response?.data ? JSON.stringify(error.response.data) : "";
      const fullError = responseData ? `${parsedError} | providerResponse=${responseData}` : parsedError;

      await MessageLogModel.updateOne(
        { _id: log._id },
        {
          $set: {
            status: "failed",
            error: fullError,
          },
        },
      );
      return [error, false];
    }
  }
}

module.exports = WhatsAppDeliveryService;
