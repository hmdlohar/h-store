const express = require("express");
const router = express.Router();
const Product = require("../models/ProductModel"); // Import the Product model
const Utils = require("../services/Utils"); // Import Utils for error parsing

// GET /api/products - List all products
router.get("/", async (req, res) => {
  try {
    // Fetch only necessary fields for the list view
    const products = await Product.find({ isActive: true }).exec(); // Changed title to name
    res.sendSuccess(products, "Products fetched successfully"); // Use res.sendSuccess
  } catch (err) {
    // Use res.sendError with parsed message and status 500
    res.sendError(
      err,
      Utils.parseErrorString(err) || "Error fetching products",
      500
    );
  }
});

// GET /api/products/:slug - Get details for a specific product by slug
router.get("/:slug", async (req, res) => {
  try {
    const productSlug = req.params.slug;
    // Fetch product by slug from the database
    const product = await Product.findOne({
      slug: productSlug,
      isActive: true,
    }).exec();

    if (product) {
      res.sendSuccess(product, "Product details fetched successfully"); // Use res.sendSuccess
    } else {
      // Use res.sendError with status 404 for not found
      res.sendError("Product not found", "Product not found", 404);
    }
  } catch (err) {
    // Use res.sendError with parsed message and status 500
    res.sendError(
      err,
      Utils.parseErrorString(err) || "Error fetching product details",
      500
    );
  }
});

module.exports = router;
