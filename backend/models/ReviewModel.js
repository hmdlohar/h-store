const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  productId: {
    type: String, // Matches ProductModel _id (can be String or ObjectId depending on how it's stored)
    ref: "Product",
    required: true,
  },
  userName: {
    type: String,
    default: "Amazon Customer",
  },
  userImage: {
    type: String, // Path to avatar
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    default: "",
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
    default: "India",
  },
  helpfulCount: {
    type: Number,
    default: 0,
  },
  variantInfo: {
    type: String, // e.g., "Colour: DARK BLUE"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster lookups by product
ReviewSchema.index({ productId: 1, createdAt: -1 });

module.exports = mongoose.model("Review", ReviewSchema);
