const express = require("express");
// const UserModel = require("../models/UserModel");
const Utils = require("../services/Utils");
const OrderModel = require("../models/OrderModel");
const utils = require("../services/Utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.sendSuccess(req.user, "User data fetched successfully");
  } catch (ex) {
    res.sendError(ex, Utils.parseErrorString(ex));
  }
});

router.get("/get-existing-address", async (req, res) => {
  try {
    const order = await OrderModel.findOne({
      userID: req.user._id,
    });

    res.sendSuccess(order?.deliveryAddress || null);
  } catch (ex) {
    res.sendError(ex, utils.parseErrorString(ex));
  }
});

module.exports = router;
