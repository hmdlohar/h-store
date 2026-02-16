const ReviewModel = require("../../models/ReviewModel");
const express = require("express");
const router = express.Router();

// GET /api/admin/reviews - List all reviews with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const productId = req.query.productId;

    const filter = productId ? { productId } : {};

    const total = await ReviewModel.countDocuments(filter);
    const reviews = await ReviewModel.find(filter)
      .populate("productId", "name mainImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.sendSuccess({
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit)
    }, "Reviews fetched successfully");
  } catch (err) {
    res.sendError(err, "Error fetching reviews", 500);
  }
});

// DELETE /api/admin/reviews/:id - Delete a review
router.delete("/:id", async (req, res) => {
  try {
    const review = await ReviewModel.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.sendError(null, "Review not found", 404);
    }
    res.sendSuccess(null, "Review deleted successfully");
  } catch (err) {
    res.sendError(err, "Error deleting review", 500);
  }
});

module.exports = router;
