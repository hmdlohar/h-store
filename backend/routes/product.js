const express = require("express");
const router = express.Router();
const Product = require("../models/ProductModel"); // Import the Product model
const Utils = require("../services/Utils"); // Import Utils for error parsing
const { parseErrorString } = require("hyper-utils");
const postHog = require("../services/PostHogService");

// GET /api/products - List all products
router.get("/", async (req, res) => {
  try {
    // Fetch only necessary fields for the list view
    const products = await Product.find({ isActive: true }).exec(); // Changed title to name
    
    postHog.capture("products_list_viewed", {
      distinct_id: req.distinctId,
      count: products.length,
      user_id: req.user?._id?.toString(),
    });
    
    res.sendSuccess(products, "Products fetched successfully"); // Use res.sendSuccess
  } catch (err) {
    // Use res.sendError with parsed message and status 500
    postHog.trackError(err, { route: "GET /products", user_id: req.user?._id, distinct_id: req.distinctId });
    res.sendError(err, parseErrorString(err) || "Error fetching products", 500);
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
      postHog.trackUserEvent(req.distinctId, "product_viewed", {
        product_id: product._id.toString(),
        slug: productSlug,
        name: product.name,
        price: product.price,
        user_id: req.user?._id?.toString(),
      });
      
      res.sendSuccess(product, "Product details fetched successfully"); // Use res.sendSuccess
    } else {
      postHog.capture("product_not_found", {
        distinct_id: req.distinctId,
        slug: productSlug,
        user_id: req.user?._id?.toString(),
      });
      // Use res.sendError with status 404 for not found
      res.sendError("Product not found", "Product not found", 404);
    }
  } catch (err) {
    // Use res.sendError with parsed message and status 500
    postHog.trackError(err, { route: "GET /products/:slug", user_id: req.user?._id, distinct_id: req.distinctId });
    res.sendError(
      err,
      parseErrorString(err) || "Error fetching product details",
      500
    );
  }
});

module.exports = router;
