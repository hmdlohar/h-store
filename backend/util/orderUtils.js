const OrderModel = require("../models/OrderModel");

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

module.exports = {
  setSubTotal,
  processOrderNotification,
};
