const express = require("express");
const router = express.Router();
const OrderModel = require("../models/OrderModel");
const utils = require("../services/Utils");
const { setSubTotal } = require("../util/orderUtils");
const ProductModel = require("../models/ProductModel");
const ImageKitService = require("../services/ImageKitService");
const multer = require("multer");
const enums = require("../enums");
const upload = multer({ storage: multer.memoryStorage() }); // or diskStorage

router.post("/", async (req, res) => {
  try {
    let order = new OrderModel(setSubTotal(req.body));
    order.userID = req.user._id;
    await order.save();
    return res.sendSuccess(order, "Order Created Successfully");
  } catch (ex) {
    console.log(ex);
    res.sendError(ex, utils.parseErrorString(ex));
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
      if (item.productId === productId) {
        item.price = variant.price;
        item.variant = variantId;
      }
      return item;
    });
    order.info = { ...order.info, variant: variantId };
    setSubTotal(order);
    await OrderModel.updateOne({ _id: orderId }, order);
    return res.sendSuccess(order, "Order updated Successfully");
  } catch (ex) {
    console.log(ex);
    res.sendError(ex, utils.parseErrorString(ex));
  }
});

router.put("/set-customization/:orderId/:productId", async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const order = await OrderModel.findById(orderId);

    const customization = req.body;
    order.items = order.items.map((item) => {
      if (item.productId === productId) {
        item.customization = customization;
      }
      return item;
    });

    await OrderModel.updateOne({ _id: orderId }, order);
    return res.sendSuccess(order, "Order updated Successfully");
  } catch (ex) {
    console.log(ex);
    res.sendError(ex, utils.parseErrorString(ex));
  }
});

router.put("/set-address/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await OrderModel.findById(orderId);

    const address = req.body;
    order.deliveryAddress = address;

    await OrderModel.updateOne({ _id: orderId }, order);
    return res.sendSuccess(order, "Order updated Successfully");
  } catch (ex) {
    console.log(ex);
    res.sendError(ex, utils.parseErrorString(ex));
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
    res.sendError(ex, utils.parseErrorString(ex));
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
    res.sendSuccess(result);
  } catch (ex) {
    res.sendError(ex, utils.parseErrorString(ex));
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
    await order.save();
    return res.sendSuccess(order, "Order paid successfully");
  } catch (ex) {
    res.sendError(ex, utils.parseErrorString(ex));
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
//     res.sendError(ex, utils.parseErrorString(ex));
//   }
// });

router.get("/:orderID?", async (req, res) => {
  try {
    const orders = await OrderModel.aggregate([
      { $match: { userID: req.user._id } },

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
          createdAt: { $first: "$createdAt" },
          orderNumber: { $first: "$orderNumber" },
          items: { $push: "$items" },
          product: { $first: "$product" },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    res.sendSuccess(orders);
  } catch (ex) {
    res.sendError(ex, utils.parseErrorString(ex));
  }
});

module.exports = router;
