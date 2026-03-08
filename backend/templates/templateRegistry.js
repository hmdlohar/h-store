module.exports = {
  "order-placed-email": {
    file: "order-placed-email.html",
    variables: ["orderID", "amount"],
  },
  "order-placed-whatsapp": {
    file: "order-placed-whatsapp.txt",
    variables: ["orderID", "amount"],
  },
  "checkout-abandoned-email": {
    file: "checkout-abandoned-email.html",
    variables: ["orderID", "amount", "checkoutUrl"],
  },
  "checkout-abandoned-whatsapp": {
    file: "checkout-abandoned-whatsapp.txt",
    variables: ["orderID", "amount", "checkoutUrl"],
  },
  "payment-reminder-email": {
    file: "payment-reminder-email.html",
    variables: ["orderID", "amount", "checkoutUrl"],
  },
  "payment-reminder-whatsapp": {
    file: "payment-reminder-whatsapp.txt",
    variables: ["orderID", "amount", "checkoutUrl"],
  },
  "order-paid-admin-email": {
    file: "order-paid-admin-email.html",
    variables: ["orderID", "amount", "customerName", "customerMobile", "customerEmail", "orderUrl"],
  },
  "order-paid-admin-whatsapp": {
    file: "order-paid-admin-whatsapp.txt",
    variables: ["orderID", "amount", "customerName", "customerMobile", "customerEmail", "orderUrl"],
  },
};
