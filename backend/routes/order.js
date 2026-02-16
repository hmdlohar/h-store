const express = require("express");
const JobQueue = require("../models/JobQueue");

const router = express.Router();
const OrderModel = require("../models/OrderModel");
const utils = require("../services/Utils");
const { setSubTotal } = require("../util/orderUtils");
const ProductModel = require("../models/ProductModel");
const ImageKitService = require("../services/ImageKitService");
const postHog = require("../services/PostHogService");
const multer = require("multer");
const enums = require("../enums");
const { parseErrorString } = require("hyper-utils");
const upload = multer({ storage: multer.memoryStorage() }); // or diskStorage

router.post("/", async (req, res) => {
  try {
    let order = new OrderModel(setSubTotal(req.body));
    order.userID = req.user?._id || null;
    await order.save();
    
    postHog.trackUserEvent(req.distinctId || req.user?._id?.toString(), "order_created", {
      order_id: order._id.toString(),
      order_number: order.orderNumber,
      amount: order.amount,
      item_count: order.items.length,
      user_id: req.user?._id?.toString(),
    });
    
    return res.sendSuccess(order, "Order Created Successfully");
  } catch (ex) {
    console.log(ex);
    postHog.trackError(ex, { route: "POST /order", user_id: req.user?._id, distinct_id: req.distinctId });
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
    
    postHog.trackUserEvent(req.distinctId, "order_variant_selected", {
      order_id: orderId,
      product_id: productId,
      variant_id: variantId,
      variant_name: variant.name,
      price: variant.price,
      user_id: req.user?._id?.toString(),
    });
    
    return res.sendSuccess(order, "Order updated Successfully");
  } catch (ex) {
    console.log(ex);
    postHog.trackError(ex, { route: "PUT /order/set-variant", user_id: req.user?._id, distinct_id: req.distinctId });
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
    
    postHog.trackUserEvent(req.distinctId || req.user?._id?.toString(), "order_customization_added", {
      order_id: orderId,
      product_id: productId,
      customization_keys: Object.keys(customization),
      user_id: req.user?._id?.toString(),
    });
    
    return res.sendSuccess(order, "Order updated Successfully");
  } catch (ex) {
    console.log(ex);
    postHog.trackError(ex, { route: "PUT /order/set-customization", user_id: req.user?._id, distinct_id: req.distinctId });
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
    
    postHog.trackUserEvent(req.distinctId || req.user?._id?.toString(), "order_address_set", {
      order_id: orderId,
      has_address: !!address,
      city: address?.city,
      state: address?.state,
      user_id: req.user?._id?.toString(),
    });
    
    return res.sendSuccess(order, "Order updated Successfully");
  } catch (ex) {
    console.log(ex);
    postHog.trackError(ex, { route: "PUT /order/set-address", user_id: req.user?._id, distinct_id: req.distinctId });
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

    postHog.trackUserEvent(req.distinctId || req.user?._id?.toString(), "order_image_uploaded", {
      order_id: orderID,
      file_name: file.originalname,
      file_size: file.size,
      user_id: req.user?._id?.toString(),
    });

    return res.sendSuccess({ orderID, filePath: result.filePath });
  } catch (ex) {
    console.log(ex);
    postHog.trackError(ex, { route: "POST /order/upload-image", user_id: req.user?._id, distinct_id: req.distinctId });
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
    order.amount = order.finalAmount || order.amount || order.total || 1;
    const result =
      await require("../services/CashfreeUtils").createCashfreeOrder(order);

    console.log(result, "result");

    order.set("pg", "cashfree");
    order.set("pgOrderID", result.order_id);

    await order.save();
    
    postHog.trackUserEvent(req.distinctId || req.user?._id?.toString(), "payment_initiated", {
      order_id: orderId,
      amount: order.amount,
      payment_gateway: "cashfree",
      pg_order_id: result.order_id,
      user_id: req.user?._id?.toString(),
    });
    
    res.sendSuccess(result);
  } catch (ex) {
    postHog.trackError(ex, { route: "POST /order/create-cashfree-order", user_id: req.user?._id, distinct_id: req.distinctId });
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
      postHog.trackUserEvent(req.distinctId || req.user?._id?.toString(), "payment_failed", {
        order_id: orderId,
        pg_order_id: order.pgOrderID,
        order_status: result?.order_status,
        amount: order.amount,
        user_id: req.user?._id?.toString(),
      });
      throw new Error("Order not paid");
    }
    order.set("status", enums.ORDER_STATUS.PAID);
    JobQueue.create({
      type: "order-paid",
      context: {
        orderId,
      },
    });
    await order.save();
    
    postHog.trackUserEvent(req.distinctId || req.user?._id?.toString(), "payment_success", {
      order_id: orderId,
      pg_order_id: order.pgOrderID,
      amount: order.amount,
      payment_gateway: "cashfree",
      user_id: req.user?._id?.toString(),
    });
    
    return res.sendSuccess(order, "Order paid successfully");
  } catch (ex) {
    postHog.trackError(ex, { route: "POST /order/verify-cashfree-order", user_id: req.user?._id, distinct_id: req.distinctId });
    res.sendError(ex, parseErrorString(ex));
  }
});

// router.get("/:orderID", async (req, res) => {
//   try {
//     const { orderID } = req.params;
//     const order = await OrderModel.findOne({
//       _id: orderID,
//       userID: req.user._id,
//     });
//     if (!order) {
//       return res.sendError("orderNotFound", "Order not found");
//     }
//     res.sendSuccess(order);
//   } catch (ex) {
//     res.sendError(ex, parseErrorString(ex));
//   }
// });

router.get("/:orderID?", async (req, res) => {
  try {
    const isSingleOrder = !!req.params.orderID;
    
    if (!isSingleOrder && !req.user) {
      return res.sendError("unauthorized", "Please login to view orders");
    }
    
    const orders = await OrderModel.aggregate([
      {
        $match: isSingleOrder 
          ? { _id: req.params.orderID }
          : { userID: req.user._id },
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
      { $sort: { createdAt: -1 } },
    ]);
    if (req.params.orderID) {
      if (orders.length === 0) {
        return res.sendError("orderNotFound", "Order not found");
      }
      res.sendSuccess(orders[0]);
    } else {
      res.sendSuccess(orders);
    }
  } catch (ex) {
    res.sendError(ex, parseErrorString(ex));
  }
});

module.exports = router;
