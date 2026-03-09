module.exports = {
  ORDER_STATUS: {
    PENDING: "pending",
    FINALIZED: "finalized",
    CONFIRMED: "confirmed",
    PAID: "paid",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  },
  PAYMENT_METHOD: {
    ONLINE: "online",
    COD: "cod",
  },
  PAYMENT_STATUS: {
    PENDING: "pending",
    PAID: "paid",
    COD_PENDING: "cod_pending",
    FAILED: "failed",
  },
  JOB_TYPE: {
    ORDER_NOTIFICATION: "order-notification",
    ORDER_PAID: "order-paid",
    COD_ORDER_PLACED: "cod-order-placed",
    COD_ORDER_CONFIRMED: "cod-order-confirmed",
  },
};
