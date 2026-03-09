const express = require("express");
const JobQueue = require("../models/JobQueue");

const router = express.Router();
const OrderModel = require("../models/OrderModel");
const { setSubTotal, getIncludedGst } = require("../util/orderUtils");
const ProductModel = require("../models/ProductModel");
const ImageKitService = require("../services/ImageKitService");
const multer = require("multer");
const enums = require("../enums");
const { parseErrorString } = require("hyper-utils");
const conversionsApiService = require("../services/ConversionsApiService");
const upload = multer({ storage: multer.memoryStorage() }); // or diskStorage

router.post("/", async (req, res) => {
  try {
    let order = new OrderModel(setSubTotal(req.body));
    order.userID = req.user?._id || null;
    order.paymentMethod = enums.PAYMENT_METHOD.ONLINE;
    order.paymentStatus = enums.PAYMENT_STATUS.PENDING;
    await order.save();
    
    
    return res.sendSuccess(order, "Order Created Successfully");
  } catch (ex) {
    console.log(ex);
    res.sendError(ex, parseErrorString(ex));
  }
});



router.post("/amazon", async (req, res) => {
  try {
    let order = new OrderModel(setSubTotal(req.body));
    order.userID = req.user?._id || null;
    await order.save();
    return res.sendSuccess(order, "Order Created Successfully");
  } catch (ex) {
    console.log(ex);
    res.sendError(ex, parseErrorString(ex));
  }
});

router.put("/set-variant/:orderId/:productId/:variantId", async (req, res) => {
  try {
    const { orderId, productId, variantId } = req.params;
    const order = await OrderModel.findById(orderId);
    const product = await ProductModel.findById(productId);
    const variant = product.variants[variantId];
    if (!variant) {
      return res.sendError("variantNotFound", "Variant not found");
    }
    order.items = order.items.map((item) => {
      if (item.productId.toString() === productId.toString()) {
        item.price = variant.price;
        item.amount = variant.price * (item.quantity || 1);
        item.variant = variantId;
      }
      return item;
    });
    order.info = { ...order.info, variant: variantId };
    setSubTotal(order);
    await order.save();
    
    
    return res.sendSuccess(order, "Order updated Successfully");
  } catch (ex) {
    console.log(ex);
    res.sendError(ex, parseErrorString(ex));
  }
});

router.put("/set-customization/:orderId/:productId", async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    
    const customization = req.body;
    await OrderModel.updateOne(
      { _id: orderId, "items.productId": productId },
      { $set: { "items.$.customization": customization } }
    );
    
    // Fetch the updated order to return complete data
    const order = await OrderModel.findById(orderId);
    
    
    return res.sendSuccess(order, "Order updated Successfully");
  } catch (ex) {
    console.log(ex);
    res.sendError(ex, parseErrorString(ex));
  }
});

router.put("/set-address/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const address = req.body;
    
    await OrderModel.updateOne(
      { _id: orderId },
      { $set: { deliveryAddress: address } }
    );
    
    // Fetch the updated order to return complete data
    const order = await OrderModel.findById(orderId);
    
    
    return res.sendSuccess(order, "Order updated Successfully");
  } catch (ex) {
    console.log(ex);
    res.sendError(ex, parseErrorString(ex));
  }
});

// Single file upload (field name should match the one in FormData)
router.post("/upload-image", upload.single("file"), async (req, res) => {
  try {
    // Access file as req.file
    const file = req.file;
    // Access other fields as req.body
    const { orderID } = req.body;

    // Now you can process or upload to ImageKit, etc.
    const result = await ImageKitService.uploadImage(
      file.buffer,
      file.originalname,
      `/order/${orderID}`
    );


    return res.sendSuccess({ orderID, filePath: result.filePath });
  } catch (ex) {
    console.log(ex);
    res.sendError(ex, parseErrorString(ex));
  }
});

// Finalize order - called when user reaches payment step
router.post("/finalize-order", async (req, res) => {
  try {
    const { orderId, paymentMethod = enums.PAYMENT_METHOD.ONLINE } = req.body;
    if (!orderId) throw new Error("orderId is required");
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error("Order not found");
    if (![enums.PAYMENT_METHOD.ONLINE, enums.PAYMENT_METHOD.COD].includes(paymentMethod)) {
      throw new Error("Invalid payment method");
    }
    
    order.set("status", enums.ORDER_STATUS.FINALIZED);
    order.set("paymentMethod", paymentMethod);
    order.set("paymentStatus", enums.PAYMENT_STATUS.PENDING);
    order.set("pg", paymentMethod === enums.PAYMENT_METHOD.COD ? "cod" : "cashfree");
    if (paymentMethod === enums.PAYMENT_METHOD.COD) {
      order.set("pgOrderID", "");
    }
    setSubTotal(order);
    order.info = {
      ...(order.info || {}),
      finalizedAt: new Date().toISOString(),
    };
    await order.save();
    
    res.sendSuccess(order, "Order finalized");
  } catch (ex) {
    res.sendError(ex, parseErrorString(ex));
  }
});

// Create Cashfree order for payment
router.post("/create-cashfree-order", async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) throw new Error("orderId is required");
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error("Order not found");
    // Calculate total amount (use your logic if needed)
    order.paymentMethod = enums.PAYMENT_METHOD.ONLINE;
    order.paymentStatus = enums.PAYMENT_STATUS.PENDING;
    setSubTotal(order);
    const result =
      await require("../services/CashfreeUtils").createCashfreeOrder(order);

    console.log(result, "result");

    order.set("pg", "cashfree");
    order.set("pgOrderID", result.order_id);

    await order.save();
    
    
    res.sendSuccess(result);
  } catch (ex) {
    res.sendError(ex, parseErrorString(ex));
  }
});

router.post("/verify-cashfree-order", async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error("Order not found");
    const result = await require("../services/CashfreeUtils").getCashfreeOrder(
      order.pgOrderID
    );

    if (result?.order_status !== "PAID") {
      throw new Error("Order not paid");
    }
    order.set("status", enums.ORDER_STATUS.PAID);
    order.set("paymentMethod", enums.PAYMENT_METHOD.ONLINE);
    order.set("paymentStatus", enums.PAYMENT_STATUS.PAID);
    order.info = {
      ...(order.info || {}),
      paidAt: new Date().toISOString(),
    };
    JobQueue.create({
      type: enums.JOB_TYPE.ORDER_PAID,
      context: {
        orderId,
      },
    });
    await order.save();
    
    // Send Purchase event to Conversions API (server-side backup)
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const fbp = req.cookies?._fbp;
    
    const eventData = {
      eventName: "Purchase",
      eventId: `purchase-${orderId}-${Date.now()}`,
      params: {
        value: order.finalAmount || order.amount || 0,
        currency: "INR",
        order_id: orderId,
        content_ids: order.items?.map(item => item.productId?.toString()) || [],
        content_name: order.items?.map(item => item.productName).join(", ") || "Order",
        content_type: "product",
        num_items: order.items?.length || 0,
      },
      url: `${process.env.FRONTEND_URL || "https://your-domain.com"}/order-success/${orderId}`,
      fbp,
      userId: order.userID,
    };
    
    // Fire and forget - don't delay the response
    conversionsApiService.sendEvent(eventData, clientIp, userAgent).catch(err => {
      console.error("Failed to send Purchase event to Conversions API:", err.message);
    });
    
    return res.sendSuccess(order, "Order paid successfully");
  } catch (ex) {
    res.sendError(ex, parseErrorString(ex));
  }
});

router.post("/place-cod-order", async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) throw new Error("orderId is required");
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error("Order not found");
    if (!order.deliveryAddress?.mobile && !order.deliveryAddress?.email) {
      throw new Error("Customer contact details are required for COD");
    }

    if (order.info?.codPlacedAt && order.paymentMethod === enums.PAYMENT_METHOD.COD) {
      return res.sendSuccess(order, "COD order already placed");
    }

    order.set("status", enums.ORDER_STATUS.FINALIZED);
    order.set("paymentMethod", enums.PAYMENT_METHOD.COD);
    order.set("paymentStatus", enums.PAYMENT_STATUS.COD_PENDING);
    order.set("pg", "cod");
    order.set("pgOrderID", "");
    setSubTotal(order);
    order.info = {
      ...(order.info || {}),
      finalizedAt: order.info?.finalizedAt || new Date().toISOString(),
      codPlacedAt: new Date().toISOString(),
    };
    await order.save();

    await JobQueue.create({
      type: enums.JOB_TYPE.COD_ORDER_PLACED,
      context: {
        orderId,
      },
    });

    return res.sendSuccess(order, "COD order placed successfully");
  } catch (ex) {
    res.sendError(ex, parseErrorString(ex));
  }
});

router.get("/:orderID", async (req, res) => {
  try {
    const orders = await OrderModel.aggregate([
      {
        $match: { _id: req.params.orderID },
      },

      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                mainImage: 1,
                name: 1,
                customizations: 1,
              },
            },
          ],
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$_id",
          userID: { $first: "$userID" },
          status: { $first: "$status" },
          subTotal: { $first: "$subTotal" },
          tax: { $first: "$tax" },
          paymentMethod: { $first: "$paymentMethod" },
          paymentStatus: { $first: "$paymentStatus" },
          deliveryCharge: { $first: "$deliveryCharge" },
          amount: { $first: "$amount" },
          deliveryAddress: { $first: "$deliveryAddress" },
          pg: { $first: "$pg" },
          pgOrderID: { $first: "$pgOrderID" },
          createdAt: { $first: "$createdAt" },
          orderNumber: { $first: "$orderNumber" },
          items: { $push: "$items" },
          product: { $first: "$product" },
        },
      },
    ]);
    if (orders.length === 0) {
      return res.sendError("orderNotFound", "Order not found");
    }
    if (!orders[0].tax && orders[0].subTotal) {
      orders[0].tax = getIncludedGst(orders[0].subTotal);
    }
    res.sendSuccess(orders[0]);
  } catch (ex) {
    res.sendError(ex, parseErrorString(ex));
  }
});

module.exports = router;
