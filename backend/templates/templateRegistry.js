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
  "cod-order-placed-email": {
    file: "cod-order-placed-email.html",
    variables: ["orderID", "amount"],
  },
  "cod-order-placed-whatsapp": {
    file: "cod-order-placed-whatsapp.txt",
    variables: ["orderID", "amount"],
  },
  "cod-order-confirmed-email": {
    file: "cod-order-confirmed-email.html",
    variables: ["orderID", "amount"],
  },
  "cod-order-confirmed-whatsapp": {
    file: "cod-order-confirmed-whatsapp.txt",
    variables: ["orderID", "amount"],
  },
  "cod-order-admin-email": {
    file: "cod-order-admin-email.html",
    variables: ["orderID", "amount", "customerName", "customerMobile", "customerEmail", "orderUrl"],
  },
  "cod-order-admin-whatsapp": {
    file: "cod-order-admin-whatsapp.txt",
    variables: ["orderID", "amount", "customerName", "customerMobile", "customerEmail", "orderUrl"],
  },
};
