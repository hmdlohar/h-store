function setSubTotal(order) {
  order.subTotal = order.items.reduce((acc, curr) => acc + curr.amount, 0);
  order.tax = order?.tax
    ? order?.tax?.reduce((acc, curr) => acc + curr.amount, 0) || 0
    : 0;
  order.amount = order.subTotal + order.tax;

  return order;
}

module.exports = {
  setSubTotal,
};
