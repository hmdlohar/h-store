const OrderModel = require("../models/OrderModel");
const MessageService = require("./MessageService");
const enums = require("../enums");

class OrderCommunicationService {
  static getEnv(name, fallback = "") {
    return process.env[name] || process.env[name.toLowerCase()] || fallback;
  }

  static getConfig() {
    return {
      frontendUrl: this.getEnv("FRONTEND_URL", "").replace(/\/+$/, ""),
      abandonedMinutes: Number(this.getEnv("ORDER_ABANDONED_MINUTES", "30")) || 30,
      paymentReminderMinutes: Number(this.getEnv("ORDER_PAYMENT_REMINDER_MINUTES", "20")) || 20,
      paymentReminderFollowupMinutes:
        Number(this.getEnv("ORDER_PAYMENT_REMINDER_FOLLOWUP_MINUTES", "180")) || 180,
      batchSize: Number(this.getEnv("ORDER_NOTIFICATION_BATCH_SIZE", "20")) || 20,
    };
  }

  static getCheckoutUrl(orderId) {
    const { frontendUrl } = this.getConfig();
    if (!frontendUrl) {
      return "";
    }
    return `${frontendUrl}/checkout/${orderId}`;
  }

  static getNotificationInfo(order) {
    return {
      ...(order.info || {}),
      notifications: {
        ...((order.info || {}).notifications || {}),
      },
    };
  }

  static async markNotification(orderId, notifications) {
    await OrderModel.updateOne(
      { _id: orderId },
      {
        $set: {
          "info.notifications": notifications,
        },
      },
    );
  }

  static async sendToCustomer(order, payload) {
    const tasks = [];
    const mobile = order.deliveryAddress?.mobile;
    const email = order.deliveryAddress?.email;

    if (mobile) {
      tasks.push(
        MessageService.sendWhatsApp({
          to: mobile,
          templateName: payload.whatsappTemplate,
          variables: payload.variables,
        }),
      );
    }
    if (email) {
      tasks.push(
        MessageService.sendEmail({
          to: email,
          subject: payload.emailSubject,
          templateName: payload.emailTemplate,
          variables: payload.variables,
        }),
      );
    }
    if (!tasks.length) {
      return false;
    }
    await Promise.all(tasks);
    return true;
  }

  static async processAbandonedCheckouts() {
    const { abandonedMinutes, batchSize } = this.getConfig();
    const threshold = new Date(Date.now() - abandonedMinutes * 60 * 1000);

    const orders = await OrderModel.find({
      status: enums.ORDER_STATUS.PENDING,
      createdAt: { $lte: threshold },
    })
      .sort({ createdAt: 1 })
      .limit(batchSize);

    let scanned = 0;
    let queued = 0;
    let skipped = 0;

    for (const order of orders) {
      scanned++;
      const notificationInfo = this.getNotificationInfo(order);
      const notifications = notificationInfo.notifications;
      if (notifications.abandonedSentAt) {
        skipped++;
        continue;
      }

      const orderID = order.orderNumber || order._id;
      const amount = `₹${order.amount}`;
      const checkoutUrl = this.getCheckoutUrl(order._id);
      const sent = await this.sendToCustomer(order, {
        whatsappTemplate: "checkout-abandoned-whatsapp",
        emailTemplate: "checkout-abandoned-email",
        emailSubject: `Complete your order - #${orderID}`,
        variables: { orderID, amount, checkoutUrl },
      });

      if (!sent) {
        skipped++;
        continue;
      }

      notifications.abandonedSentAt = new Date().toISOString();
      await this.markNotification(order._id, notifications);
      queued++;
    }

    return { scanned, queued, skipped };
  }

  static async processPaymentReminders() {
    const { paymentReminderMinutes, paymentReminderFollowupMinutes, batchSize } = this.getConfig();
    const now = Date.now();
    const firstThreshold = new Date(now - paymentReminderMinutes * 60 * 1000);

    const orders = await OrderModel.find({
      status: enums.ORDER_STATUS.FINALIZED,
      paymentMethod: enums.PAYMENT_METHOD.ONLINE,
      paymentStatus: enums.PAYMENT_STATUS.PENDING,
      createdAt: { $lte: firstThreshold },
    })
      .sort({ createdAt: 1 })
      .limit(batchSize);

    let scanned = 0;
    let queued = 0;
    let skipped = 0;

    for (const order of orders) {
      scanned++;
      const notificationInfo = this.getNotificationInfo(order);
      const notifications = notificationInfo.notifications;

      const baseTime = new Date(
        order.info?.finalizedAt || order.createdAt || Date.now(),
      ).getTime();
      const firstEligibleAt = baseTime + paymentReminderMinutes * 60 * 1000;
      const secondEligibleAt = baseTime + paymentReminderFollowupMinutes * 60 * 1000;

      let stage = "";
      if (!notifications.paymentReminder1SentAt && now >= firstEligibleAt) {
        stage = "1";
      } else if (
        notifications.paymentReminder1SentAt &&
        !notifications.paymentReminder2SentAt &&
        now >= secondEligibleAt
      ) {
        stage = "2";
      }

      if (!stage) {
        skipped++;
        continue;
      }

      const orderID = order.orderNumber || order._id;
      const amount = `₹${order.amount}`;
      const checkoutUrl = this.getCheckoutUrl(order._id);
      const sent = await this.sendToCustomer(order, {
        whatsappTemplate: "payment-reminder-whatsapp",
        emailTemplate: "payment-reminder-email",
        emailSubject: `Payment reminder - #${orderID}`,
        variables: { orderID, amount, checkoutUrl },
      });

      if (!sent) {
        skipped++;
        continue;
      }

      const key = stage === "1" ? "paymentReminder1SentAt" : "paymentReminder2SentAt";
      notifications[key] = new Date().toISOString();
      await this.markNotification(order._id, notifications);
      queued++;
    }

    return { scanned, queued, skipped };
  }

  static async processOrderReminders() {
    const [abandoned, payment] = await Promise.all([
      this.processAbandonedCheckouts(),
      this.processPaymentReminders(),
    ]);
    return { abandoned, payment };
  }
}

module.exports = OrderCommunicationService;
