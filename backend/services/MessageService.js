const MessageLogModel = require("../models/MessageLogModel");
const MessageTemplateService = require("./MessageTemplateService");

class MessageService {
  static async sendSMS({ to, message, templateName, variables }) {
    let content = message;
    let templateUsed = null;

    if (templateName) {
      const rendered = await MessageTemplateService.renderTemplate(templateName, variables);
      content = rendered.content;
      templateUsed = rendered.templateName;
    }

    const messageLog = new MessageLogModel({
      type: "sms",
      content,
      to,
      info: { templateUsed },
    });
    await messageLog.save();
    return messageLog;
  }

  static async sendEmail({ to, subject, message, templateName, variables }) {
    let emailSubject = subject;
    let content = message;
    let templateUsed = null;

    if (!emailSubject) {
      throw new Error("Email subject is required");
    }

    if (templateName) {
      const rendered = await MessageTemplateService.renderTemplate(templateName, variables);
      content = rendered.content;
      templateUsed = rendered.templateName;
    }

    const emailLog = new MessageLogModel({
      type: "email",
      content,
      to,
      subject: emailSubject,
      info: { templateUsed },
    });
    await emailLog.save();
    return emailLog;
  }

  static async sendWhatsApp({ to, message, templateName, variables }) {
    let content = message;
    let templateUsed = null;

    if (templateName) {
      const rendered = await MessageTemplateService.renderTemplate(templateName, variables);
      content = rendered.content;
      templateUsed = rendered.templateName;
    }

    const messageLog = new MessageLogModel({
      type: "whatsapp",
      content,
      to,
      info: { templateUsed },
    });
    await messageLog.save();
    return messageLog;
  }

  static async sendByTemplate({ to, type, subject, templateName, variables }) {
    if (!type) {
      throw new Error("Message type is required");
    }
    const rendered = await MessageTemplateService.renderTemplate(templateName, variables);
    if (type === "email" && !subject) {
      throw new Error("Email subject is required");
    }

    const messageLog = new MessageLogModel({
      type,
      content: rendered.content,
      to,
      subject: type === "email" ? subject : undefined,
      info: { templateUsed: rendered.templateName },
    });
    await messageLog.save();
    return messageLog;
  }
}

module.exports = MessageService;
