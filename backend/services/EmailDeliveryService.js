const { parseErrorString } = require("hyper-utils");
const MessageLogModel = require("../models/MessageLogModel");
const SESEmailService = require("./SESEmailService");

class EmailDeliveryService {
  static stripHtml(html = "") {
    if (!html) return "";
    return html
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  static getSender() {
    return process.env.SES_FROM || "Hamid from Giftsh.in <no-reply@mail.giftsh.in>";
  }

  static async sendViaSES(payload) {
    const result = await SESEmailService.sendEmail(payload);
    return { provider: "ses", id: result?.MessageId || "" };
  }

  static async processPendingEmailLogs(limit = 5) {
    const logs = await MessageLogModel.find({ type: "email", status: "pending" })
      .sort({ createdAt: 1 })
      .limit(limit);

    if (!logs.length) return { scanned: 0, sent: 0, failed: 0 };

    let sent = 0;
    let failed = 0;

    for (const log of logs) {
      const [error] = await this.processEmailLog(log);
      if (error) {
        failed++;
      } else {
        sent++;
      }
    }

    return { scanned: logs.length, sent, failed };
  }

  static async processEmailLog(log) {
    try {
      const subject = log.subject || "Notification from Giftsh.in";
      const html = log.content || "";
      const text = this.stripHtml(html) || html || " ";

      const providerResponse = await this.sendViaSES({
        from: this.getSender(),
        to: log.to,
        subject,
        html,
        text,
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
              providerId: providerResponse.id,
            },
          },
        },
      );
      return [null, true];
    } catch (error) {
      const parsedError = parseErrorString(error);
      await MessageLogModel.updateOne(
        { _id: log._id },
        {
          $set: {
            status: "failed",
            error: parsedError,
          },
        },
      );
      return [error, false];
    }
  }
}

module.exports = EmailDeliveryService;
