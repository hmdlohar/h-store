const MessageLogModel = require("../models/MessageLogModel");

class MessageService {
  static async sendSMS({ to, message }) {
    const messageLog = new MessageLogModel({
      type: "sms",
      content: message,
      to,
    });
    await messageLog.save();
  }

  static async sendEmail({ to, subject, message }) {
    const emailLog = new MessageLogModel({
      type: "email",
      content: message,
      to,
      subject,
    });
    await emailLog.save();
  }
}

module.exports = MessageService;
