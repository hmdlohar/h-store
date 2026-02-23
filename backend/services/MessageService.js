const MessageLogModel = require("../models/MessageLogModel");
const MessageTemplateService = require("./MessageTemplateService");

class MessageService {
  static async sendSMS({ to, message, templateName, variables }) {
    let content = message;
    let templateId = null;
    let templateUsed = null;

    if (templateName) {
      const rendered = await MessageTemplateService.renderTemplate(templateName, variables, "sms");
      content = rendered.content;
      templateId = rendered.templateId;
      templateUsed = rendered.templateName;
    }

    const messageLog = new MessageLogModel({
      type: "sms",
      content,
      to,
      info: { templateId, templateUsed },
    });
    await messageLog.save();
    return messageLog;
  }

  static async sendEmail({ to, subject, message, templateName, variables }) {
    let emailSubject = subject;
    let content = message;
    let templateId = null;
    let templateUsed = null;

    if (templateName) {
      const rendered = await MessageTemplateService.renderTemplate(templateName, variables, "email");
      emailSubject = rendered.subject || subject;
      content = rendered.content;
      templateId = rendered.templateId;
      templateUsed = rendered.templateName;
    }

    const emailLog = new MessageLogModel({
      type: "email",
      content,
      to,
      subject: emailSubject,
      info: { templateId, templateUsed },
    });
    await emailLog.save();
    return emailLog;
  }

  static async sendWhatsApp({ to, message, templateName, variables }) {
    let content = message;
    let templateId = null;
    let templateUsed = null;

    if (templateName) {
      const rendered = await MessageTemplateService.renderTemplate(templateName, variables, "whatsapp");
      content = rendered.content;
      templateId = rendered.templateId;
      templateUsed = rendered.templateName;
    }

    const messageLog = new MessageLogModel({
      type: "whatsapp",
      content,
      to,
      info: { templateId, templateUsed },
    });
    await messageLog.save();
    return messageLog;
  }

  static async sendByTemplate({ to, templateName, variables }) {
    const rendered = await MessageTemplateService.renderTemplate(templateName, variables);

    const messageLog = new MessageLogModel({
      type: rendered.type,
      content: rendered.content,
      to,
      subject: rendered.subject,
      info: { templateId: rendered.templateId, templateUsed: rendered.templateName },
    });
    await messageLog.save();
    return messageLog;
  }
}

module.exports = MessageService;
