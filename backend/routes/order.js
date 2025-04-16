const express = require("express");
const router = express.Router();
const OrderModel = require("../models/OrderModel");
const utils = require("../services/Utils");

router.post("/", async (req, res) => {
  try {
    let order = new OrderModel(req.body);
    await order.save();
    return res.sendSuccess(order, "Order placed Successfully");
  } catch (ex) {
    console.log(ex);
    res.sendError(ex, utils.parseErrorString(ex));
  }
});
