let SESv2Client = null;
let SendEmailCommand = null;
try {
  const ses = require("@aws-sdk/client-sesv2");
  SESv2Client = ses.SESv2Client;
  SendEmailCommand = ses.SendEmailCommand;
} catch (error) {
  SESv2Client = null;
  SendEmailCommand = null;
}

class SESEmailService {
  static getEnv(name, fallback = "") {
    return process.env[name] || process.env[name.toLowerCase()] || fallback;
  }

  static getConfig() {
    return {
      region: this.getEnv("AWS_REGION", this.getEnv("SES_AWS_REGION", "ap-south-1")),
      from: this.getEnv("SES_FROM", "Hamid from Giftsh.in <no-reply@mail.giftsh.in>"),
      configurationSetName: this.getEnv("SES_CONFIGURATION_SET", ""),
    };
  }

  static getClient() {
    if (!SESv2Client || !SendEmailCommand) {
      throw new Error(
        'AWS SES SDK is not installed. Run: "cd backend && npm install @aws-sdk/client-sesv2 --save"',
      );
    }

    const { region } = this.getConfig();
    if (!region) {
      throw new Error("AWS_REGION (or SES_AWS_REGION) is required");
    }

    return new SESv2Client({ region });
  }

  static normalizeList(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  static async sendEmail(payload = {}) {
    const client = this.getClient();
    const config = this.getConfig();

    const toAddresses = this.normalizeList(payload.to);
    const ccAddresses = this.normalizeList(payload.cc);
    const bccAddresses = this.normalizeList(payload.bcc);
    const replyToAddresses = this.normalizeList(payload.replyTo);
    const subject = payload.subject;
    const html = payload.html;
    const text = payload.text;

    if (!toAddresses.length) {
      throw new Error("Email recipient (to) is required");
    }
    if (!subject) {
      throw new Error("Email subject is required");
    }
    if (!html && !text) {
      throw new Error("Email text or html content is required");
    }

    const command = new SendEmailCommand({
      FromEmailAddress: payload.from || config.from,
      Destination: {
        ToAddresses: toAddresses,
        CcAddresses: ccAddresses.length ? ccAddresses : undefined,
        BccAddresses: bccAddresses.length ? bccAddresses : undefined,
      },
      ReplyToAddresses: replyToAddresses.length ? replyToAddresses : undefined,
      Content: {
        Simple: {
          Subject: {
            Data: subject,
            Charset: "UTF-8",
          },
          Body: {
            Html: html
              ? {
                  Data: html,
                  Charset: "UTF-8",
                }
              : undefined,
            Text: text
              ? {
                  Data: text,
                  Charset: "UTF-8",
                }
              : undefined,
          },
        },
      },
      ConfigurationSetName: payload.configurationSetName || config.configurationSetName || undefined,
    });

    return client.send(command);
  }
}

module.exports = SESEmailService;
