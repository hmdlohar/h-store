const express = require("express");
const router = express.Router();
const JobQueue = require("../../models/JobQueue");

router.post("/", async (req, res) => {
  const { page = 1, pageSize = 20, status, type, search } = req.body;

  try {
    const matchConditions = {};

    if (status) {
      matchConditions.status = status;
    }

    if (type) {
      matchConditions.type = type;
    }

    if (search) {
      matchConditions.$or = [
        { _id: search },
        { type: { $regex: search, $options: "i" } },
        { error: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await JobQueue.find(matchConditions)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const total = await JobQueue.countDocuments(matchConditions);

    res.sendSuccess({
      jobs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.sendError("Failed to fetch jobs", 500);
  }
});

router.post("/create", async (req, res) => {
  const { type, context = {} } = req.body;

  if (!type) {
    return res.sendError("Job type is required", 400);
  }

  try {
    const job = new JobQueue({ type, context });
    await job.save();
    res.sendSuccess(job, "Job created successfully");
  } catch (error) {
    console.error("Error creating job:", error);
    res.sendError("Failed to create job", 500);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { status, context, error } = req.body;

  try {
    const updateData = {};
    if (status) updateData.status = status;
    if (context) updateData.context = context;
    if (error !== undefined) updateData.error = error;

    const job = await JobQueue.findByIdAndUpdate(id, updateData, { new: true });

    if (!job) {
      return res.sendError("Job not found", 404);
    }

    res.sendSuccess(job, "Job updated successfully");
  } catch (error) {
    console.error("Error updating job:", error);
    res.sendError("Failed to update job", 500);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const job = await JobQueue.findByIdAndDelete(id);

    if (!job) {
      return res.sendError("Job not found", 404);
    }

    res.sendSuccess(null, "Job deleted successfully");
  } catch (error) {
    console.error("Error deleting job:", error);
    res.sendError("Failed to delete job", 500);
  }
});

router.post("/retry/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const job = await JobQueue.findById(id);

    if (!job) {
      return res.sendError("Job not found", 404);
    }

    job.status = "pending";
    job.error = "";
    await job.save();

    res.sendSuccess(job, "Job queued for retry");
  } catch (error) {
    console.error("Error retrying job:", error);
    res.sendError("Failed to retry job", 500);
  }
});

router.post("/bulk-action", async (req, res) => {
  const { action, jobIds } = req.body;

  if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
    return res.sendError("Job IDs are required", 400);
  }

  try {
    let updateData = {};

    switch (action) {
      case "retry":
        updateData = { status: "pending", error: "" };
        break;
      case "delete":
        await JobQueue.deleteMany({ _id: { $in: jobIds } });
        res.sendSuccess(null, `${jobIds.length} jobs deleted`);
        return;
      case "mark_failed":
        updateData = { status: "failed" };
        break;
      default:
        return res.sendError("Invalid action", 400);
    }

    await JobQueue.updateMany({ _id: { $in: jobIds } }, { $set: updateData });

    res.sendSuccess(null, `Action completed on ${jobIds.length} jobs`);
  } catch (error) {
    console.error("Error performing bulk action:", error);
    res.sendError("Failed to perform bulk action", 500);
  }
});

router.get("/stats", async (req, res) => {
  try {
    const stats = await JobQueue.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const typeStats = await JobQueue.aggregate([
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
    console.error("Error fetching job stats:", error);
    res.sendError("Failed to fetch job stats", 500);
  }
});

module.exports = router;
