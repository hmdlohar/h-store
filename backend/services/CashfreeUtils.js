const axios = require("axios");

const CASHFREE_BASE_URL =
  process.env.CASHFREE_BASE_URL || "https://sandbox.cashfree.com/pg";
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

/**
 * Creates a Cashfree order using v2023-08-01 API (no token needed)
 * @param {object} order - Order object from DB
 * @returns {Promise<object>} - Cashfree order response
 */
async function createCashfreeOrder(order) {
  try {
    const res = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
      {
        order_id: order._id,
        order_amount: order.amount,
        order_currency: "INR",
        customer_details: {
          customer_id: order.userId || order._id,
          customer_email: order.deliveryAddress?.email,
          customer_phone: order.deliveryAddress?.mobile,
        },
        order_meta: {
          return_url: `${process.env.APP_ROOT_URL}/order/payment-callback?order_id={order._id}`,
        },
      },
      {
        headers: {
          "x-client-id": CASHFREE_CLIENT_ID,
          "x-client-secret": CASHFREE_CLIENT_SECRET,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json",
      },
    }
    );
    return res.data;
  } catch (err) {
    // If order already exists, fetch its details
    if (
      err.response &&
      err.response.data &&
      (err.response.data.message?.includes("already present") || err.response.data.message?.includes("already been used"))
    ) {
      // Fetch existing order from Cashfree
      const getRes = await axios.get(
        `${CASHFREE_BASE_URL}/orders/${order._id}`,
        {
          headers: {
            "x-client-id": CASHFREE_CLIENT_ID,
            "x-client-secret": CASHFREE_CLIENT_SECRET,
            "x-api-version": "2023-08-01",
            "Content-Type": "application/json",
          },
        }
      );
      return getRes.data;
    }
    throw err;
  }
}

module.exports = { createCashfreeOrder };
