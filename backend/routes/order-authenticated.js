const express = require("express");
const router = express.Router();
const OrderModel = require("../models/OrderModel");
const { parseErrorString } = require("hyper-utils");

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
