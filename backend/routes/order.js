const express = require("express");
const router = express.Router();
const OrderModel = require("../models/OrderModel");
const utils = require("../services/Utils");
const { setSubTotal } = require("../util/orderUtils");
const ProductModel = require("../models/ProductModel");
const ImageKitService = require("../services/ImageKitService");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // or diskStorage

router.post("/", async (req, res) => {
  try {
    let order = new OrderModel(setSubTotal(req.body));
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

module.exports = router;
