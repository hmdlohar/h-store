const express = require("express");
const router = express.Router();
const MessageLog = require("../../models/MessageLogModel");

router.post("/", async (req, res) => {
  const { page = 1, pageSize = 20, type, status, search } = req.body;

  try {
    const matchConditions = {};

    if (type) {
      matchConditions.type = type;
    }

    if (status) {
      matchConditions.status = status;
    }

    if (search) {
      matchConditions.$or = [
        { to: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const logs = await MessageLog.find(matchConditions)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const total = await MessageLog.countDocuments(matchConditions);

    res.sendSuccess({
      logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching message logs:", error);
    res.sendError("Failed to fetch message logs", 500);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { status, error } = req.body;

  try {
    const updateData = {};
    if (status) updateData.status = status;
    if (error !== undefined) updateData.error = error;

    const log = await MessageLog.findByIdAndUpdate(id, updateData, { new: true });

    if (!log) {
      return res.sendError("Message log not found", 404);
    }

    res.sendSuccess(log, "Message log updated successfully");
  } catch (error) {
    console.error("Error updating message log:", error);
    res.sendError("Failed to update message log", 500);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const log = await MessageLog.findByIdAndDelete(id);

    if (!log) {
      return res.sendError("Message log not found", 404);
    }

    res.sendSuccess(null, "Message log deleted successfully");
  } catch (error) {
    console.error("Error deleting message log:", error);
    res.sendError("Failed to delete message log", 500);
  }
});

router.post("/bulk-action", async (req, res) => {
  const { action, logIds } = req.body;

  if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
    return res.sendError("Log IDs are required", 400);
  }

  try {
    switch (action) {
      case "delete":
        await MessageLog.deleteMany({ _id: { $in: logIds } });
        res.sendSuccess(null, `${logIds.length} logs deleted`);
        return;
      case "retry":
        await MessageLog.updateMany(
          { _id: { $in: logIds } },
          { $set: { status: "pending", error: "" } }
        );
        break;
      case "mark_sent":
        await MessageLog.updateMany({ _id: { $in: logIds } }, { $set: { status: "sent" } });
        break;
      case "mark_failed":
        await MessageLog.updateMany({ _id: { $in: logIds } }, { $set: { status: "failed" } });
        break;
      default:
        return res.sendError("Invalid action", 400);
    }

    res.sendSuccess(null, `Action completed on ${logIds.length} logs`);
  } catch (error) {
    console.error("Error performing bulk action:", error);
    res.sendError("Failed to perform bulk action", 500);
  }
});

router.get("/stats", async (req, res) => {
  try {
    const stats = await MessageLog.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const typeStats = await MessageLog.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = stats.reduce((acc, s) => {
      acc[s._id || "unknown"] = s.count;
      return acc;
    }, {});

    res.sendSuccess({
      byStatus: statsMap,
      byType: typeStats,
    });
  } catch (error) {
    console.error("Error fetching message log stats:", error);
    res.sendError("Failed to fetch message log stats", 500);
  }
});

module.exports = router;
