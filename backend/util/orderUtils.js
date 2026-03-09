const OrderModel = require("../models/OrderModel");
const MessageService = require("../services/MessageService");

function parseRecipients(value = "") {
  return String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function getCodCharge() {
  const value = Number(process.env.COD_CHARGE || "80");
  return Number.isFinite(value) ? value : 80;
}

function getDeliveryCharge(paymentMethod) {
  return paymentMethod === "cod" ? getCodCharge() : 0;
}

function getIncludedGst(amount) {
  const numericAmount = Number(amount || 0);
  if (!numericAmount) return 0;
  return Number((numericAmount - numericAmount / 1.18).toFixed(2));
}

function getAdminVariables(order) {
  const orderID = order.orderNumber || order._id;
  const amount = `₹${order.amount}`;
  const frontendUrl = String(process.env.FRONTEND_URL || "").replace(/\/+$/, "");
  const orderUrl = frontendUrl ? `${frontendUrl}/admin/orders` : "";
  return {
    orderID,
    amount,
    customerName: order.deliveryAddress?.name || "Unknown",
    customerMobile: order.deliveryAddress?.mobile || "-",
    customerEmail: order.deliveryAddress?.email || "-",
    orderUrl,
  };
}

async function sendAdminNotifications({ order, emailSubject, emailTemplate, whatsappTemplate }) {
  const adminVariables = getAdminVariables(order);
  const adminTasks = [];
  const adminEmails = parseRecipients(process.env.ADMIN_ORDER_NOTIFY_EMAILS);
  const adminWhatsApp = parseRecipients(process.env.ADMIN_ORDER_NOTIFY_WHATSAPP);

  adminEmails.forEach((to) => {
    adminTasks.push(
      MessageService.sendEmail({
        to,
        subject: emailSubject,
        templateName: emailTemplate,
        variables: adminVariables,
      }),
    );
  });

  adminWhatsApp.forEach((to) => {
    adminTasks.push(
      MessageService.sendWhatsApp({
        to,
        templateName: whatsappTemplate,
        variables: adminVariables,
      }),
    );
  });

  if (adminTasks.length) {
    await Promise.all(adminTasks);
  }

  return adminTasks.length;
}

function setSubTotal(order) {
  order.subTotal = order.items.reduce((acc, curr) => acc + curr.amount, 0);
  order.tax = getIncludedGst(order.subTotal);
  order.deliveryCharge = getDeliveryCharge(order.paymentMethod);
  order.amount = order.subTotal + order.deliveryCharge;

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
  const adminTaskCount = await sendAdminNotifications({
    order,
    emailSubject: `New paid order - #${orderID}`,
    emailTemplate: "order-paid-admin-email",
    whatsappTemplate: "order-paid-admin-whatsapp",
  });

  if (!sendTasks.length && !adminTaskCount) {
    throw new Error("No recipients available for customer or admin notifications");
  }

  return `Order ${orderID} notifications queued`;
}

async function processCodOrderPlaced(orderId) {
  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  const orderID = order.orderNumber || order._id;
  const amount = `₹${order.amount}`;
  const variables = { orderID, amount };
  const sendTasks = [];

  if (order.deliveryAddress?.mobile) {
    sendTasks.push(
      MessageService.sendWhatsApp({
        to: order.deliveryAddress.mobile,
        templateName: "cod-order-placed-whatsapp",
        variables,
      }),
    );
  }

  if (order.deliveryAddress?.email) {
    sendTasks.push(
      MessageService.sendEmail({
        to: order.deliveryAddress.email,
        subject: `COD Order Received - #${orderID}`,
        templateName: "cod-order-placed-email",
        variables,
      }),
    );
  }

  await Promise.all(sendTasks);

  const adminTaskCount = await sendAdminNotifications({
    order,
    emailSubject: `New COD order - #${orderID}`,
    emailTemplate: "cod-order-admin-email",
    whatsappTemplate: "cod-order-admin-whatsapp",
  });

  if (!sendTasks.length && !adminTaskCount) {
    throw new Error("No recipients available for customer or admin notifications");
  }

  return `COD order ${orderID} notifications queued`;
}

async function processCodOrderConfirmed(orderId) {
  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  const orderID = order.orderNumber || order._id;
  const amount = `₹${order.amount}`;
  const variables = { orderID, amount };
  const sendTasks = [];

  if (order.deliveryAddress?.mobile) {
    sendTasks.push(
      MessageService.sendWhatsApp({
        to: order.deliveryAddress.mobile,
        templateName: "cod-order-confirmed-whatsapp",
        variables,
      }),
    );
  }

  if (order.deliveryAddress?.email) {
    sendTasks.push(
      MessageService.sendEmail({
        to: order.deliveryAddress.email,
        subject: `COD Order Confirmed - #${orderID}`,
        templateName: "cod-order-confirmed-email",
        variables,
      }),
    );
  }

  if (!sendTasks.length) {
    throw new Error("No customer recipients available for COD confirmation notification");
  }

  await Promise.all(sendTasks);
  return `COD order ${orderID} confirmed notifications queued`;
}

module.exports = {
  setSubTotal,
  processOrderNotification,
  processOrderPaid,
  processCodOrderPlaced,
  processCodOrderConfirmed,
  getCodCharge,
  getIncludedGst,
};
