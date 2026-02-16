const express = require("express");
const router = express.Router();
const Review = require("../models/ReviewModel");
const Product = require("../models/ProductModel");

// Get all reviews for a specific product by product ID or slug
router.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // We assume ID is the product _id. If it's a slug, we'd need to find the product first.
    // However, for simplicity and consistency with other routes, let's allow both or assume _id for now.
    const reviews = await Review.find({ productId: id }).sort({ createdAt: -1 });
    res.sendSuccess(reviews);
  } catch (err) {
    res.sendError(err, err.message);
  }
});

// Submit a new review
router.post("/", async (req, res) => {
  const { productId, userName, rating, title, content, variantInfo, createdAt } = req.body;

  if (!productId || rating === undefined) {
    return res.status(400).json({ message: "Product ID and Rating are required" });
  }

  try {
    const newReview = new Review({
      productId,
      userName,
      rating,
      title,
      content,
      variantInfo,
      createdAt: createdAt || Date.now(),
      isVerifiedPurchase: true, // For now, let's assume all reviews submitted via web are verified or handled later
    });

    const savedReview = await newReview.save();

    // Optionally update the product's average rating and review count
    const product = await Product.findById(productId);
    if (product) {
      const allReviews = await Review.find({ productId });
      const totalRatings = allReviews.reduce((sum, r) => sum + r.rating, 0);
      product.reviewCount = allReviews.length;
      product.rating = (totalRatings / allReviews.length).toFixed(1);
      await product.save();
    }

    res.sendSuccess(savedReview);
  } catch (err) {
    res.sendError(err, err.message);
  }
});

module.exports = router;
