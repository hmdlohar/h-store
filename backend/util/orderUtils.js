const OrderModel = require("../models/OrderModel");
const MessageService = require("../services/MessageService");

function parseRecipients(value = "") {
  return String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function setSubTotal(order) {
  order.subTotal = order.items.reduce((acc, curr) => acc + curr.amount, 0);
  order.tax = order?.tax
    ? order?.tax?.reduce((acc, curr) => acc + curr.amount, 0) || 0
    : 0;
  order.amount = order.subTotal + order.tax;

  return order;
}

async function processOrderNotification(orderId) {
  const order = await OrderModel.findById(orderId);
  const message = `Order ${order._id} has been paid.`;
  return message;
}

async function processOrderPaid(orderId) {
  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  const orderID = order.orderNumber || order._id;
  const amount = `₹${order.amount}`;
  const variables = { orderID, amount };

  const mobile = order.deliveryAddress?.mobile;
  const email = order.deliveryAddress?.email;

  const sendTasks = [];

  if (mobile) {
    sendTasks.push(
      MessageService.sendWhatsApp({
        to: mobile,
        templateName: "order-placed-whatsapp",
        variables,
      }),
    );
  }

  if (email) {
    sendTasks.push(
      MessageService.sendEmail({
        to: email,
        subject: `Order Placed - #${orderID}`,
        templateName: "order-placed-email",
        variables,
      }),
    );
  }

  await Promise.all(sendTasks);

  const frontendUrl = String(process.env.FRONTEND_URL || "").replace(/\/+$/, "");
  const orderUrl = frontendUrl ? `${frontendUrl}/admin/orders` : "";
  const customerName = order.deliveryAddress?.name || "Unknown";
  const customerMobile = order.deliveryAddress?.mobile || "-";
  const customerEmail = order.deliveryAddress?.email || "-";

  const adminVariables = {
    orderID,
    amount,
    customerName,
    customerMobile,
    customerEmail,
    orderUrl,
  };

  const adminTasks = [];
  const adminEmails = parseRecipients(process.env.ADMIN_ORDER_NOTIFY_EMAILS);
  const adminWhatsApp = parseRecipients(process.env.ADMIN_ORDER_NOTIFY_WHATSAPP);

  adminEmails.forEach((to) => {
    adminTasks.push(
      MessageService.sendEmail({
        to,
        subject: `New paid order - #${orderID}`,
        templateName: "order-paid-admin-email",
        variables: adminVariables,
      }),
    );
  });

  adminWhatsApp.forEach((to) => {
    adminTasks.push(
      MessageService.sendWhatsApp({
        to,
        templateName: "order-paid-admin-whatsapp",
        variables: adminVariables,
      }),
    );
  });

  if (adminTasks.length) {
    await Promise.all(adminTasks);
  }

  if (!sendTasks.length && !adminTasks.length) {
    throw new Error("No recipients available for customer or admin notifications");
  }

  return `Order ${orderID} notifications queued`;
}

module.exports = {
  setSubTotal,
  processOrderNotification,
  processOrderPaid,
};
