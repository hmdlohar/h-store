const express = require("express");
const router = express.Router();
const OrderModel = require("../../models/OrderModel");
const mongoose = require("mongoose");

router.post("/", async (req, res) => {
  const { page = 1, pageSize = 10, status, orderID, search, sortBy, sortOrder = "desc", excludePending } = req.body;

  try {
    const matchConditions = {};

    if (orderID) {
      matchConditions._id = orderID;
    }

    if (status) {
      matchConditions.status = status;
    }

    if (excludePending) {
      matchConditions.status = { $ne: "pending" };
    }

    if (search) {
      matchConditions.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "deliveryAddress.name": { $regex: search, $options: "i" } },
        { "deliveryAddress.mobile": { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const [orders, total] = await Promise.all([
      OrderModel.aggregate([
        { $match: matchConditions },
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
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
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
          },
        },
        { $sort: sortOptions },
        { $skip: (page - 1) * pageSize },
        { $limit: parseInt(pageSize) },
      ]),
      OrderModel.countDocuments(matchConditions),
    ]);

    res.sendSuccess({ data: orders, total });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.sendError("Failed to fetch orders", 500);
  }
});

module.exports = router;
