const express = require("express");
const router = express.Router();
const OrderModel = require("../../models/OrderModel");
const MessageService = require("../../services/MessageService");

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

router.post("/:id/send-order-placed", async (req, res) => {
  const { id } = req.params;
  const { channel } = req.body;

  if (!["email", "whatsapp"].includes(channel)) {
    return res.sendError("invalidChannel", "Channel must be email or whatsapp", 400);
  }

  try {
    const order = await OrderModel.findById(id);
    if (!order) {
      return res.sendError("notFound", "Order not found", 404);
    }

    const orderID = order.orderNumber || order._id;
    const amount = `₹${order.amount}`;

    if (channel === "email") {
      const to = order.deliveryAddress?.email;
      if (!to) {
        return res.sendError("missingEmail", "Customer email is missing for this order", 400);
      }

      const messageLog = await MessageService.sendEmail({
        to,
        subject: `Order Placed - #${orderID}`,
        templateName: "order-placed-email",
        variables: { orderID, amount },
      });

      return res.sendSuccess({ messageLog }, "Order placed email sent");
    }

    const to = order.deliveryAddress?.mobile;
    if (!to) {
      return res.sendError("missingMobile", "Customer mobile is missing for this order", 400);
    }

    const messageLog = await MessageService.sendWhatsApp({
      to,
      templateName: "order-placed-whatsapp",
      variables: { orderID, amount },
    });

    return res.sendSuccess({ messageLog }, "Order placed WhatsApp sent");
  } catch (error) {
    console.error("Error sending order placed message:", error);
    return res.sendError("sendFailed", "Failed to send order placed message", 500);
  }
});

module.exports = router;
