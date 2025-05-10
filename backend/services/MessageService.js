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
}

module.exports = MessageService;
