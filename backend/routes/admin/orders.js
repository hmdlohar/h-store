const express = require("express");
const router = express.Router();
const OrderModel = require("../../models/OrderModel");
const mongoose = require("mongoose");

router.post("/", async (req, res) => {
  const { page = 1, pageSize = 10, status, orderID } = req.body;

  try {
    // Build match conditions
    const matchConditions = {
      ...(orderID && { _id: orderID }),
    };
    if (status) {
      matchConditions.status = status;
    }

    const orders = await OrderModel.aggregate([
      {
        $match: matchConditions,
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
      {
        $skip: (page - 1) * pageSize,
      },
      {
        $limit: pageSize,
      },
    ]);

    res.sendSuccess(orders);
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.sendError("Failed to fetch orders", 500);
  }
});

module.exports = router;
