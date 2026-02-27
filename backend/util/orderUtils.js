const OrderModel = require("../models/OrderModel");
const MessageService = require("../services/MessageService");

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

  if (!mobile && !email) {
    throw new Error("Both customer mobile and email are missing");
  }

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
  return `Order ${orderID} notifications queued`;
}

module.exports = {
  setSubTotal,
  processOrderNotification,
  processOrderPaid,
};
