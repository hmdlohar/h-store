const ProductModel = require("../../models/ProductModel");
const express = require("express");
const router = express.Router();

// GET /api/admin/products - List all products (including inactive)
router.get("/", async (req, res) => {
  try {
    const products = await ProductModel.find().sort({ createdAt: -1 }).exec();
    res.sendSuccess(products, "Products fetched successfully");
  } catch (err) {
    res.sendError(err, "Error fetching products", 500);
  }
});

// GET /api/admin/products/:id - Get a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.sendError(null, "Product not found", 404);
    }
    res.sendSuccess(product, "Product fetched successfully");
  } catch (err) {
    res.sendError(err, "Error fetching product", 500);
  }
});

// POST /api/admin/products - Create a new product
router.post("/", async (req, res) => {
  try {
    const productData = req.body;
    
    // Ensure _id is not set manually
    delete productData._id;
    
    // Create slug from name if not provided
    if (!productData.slug) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
    
    // Ensure variants is an object
    if (!productData.variants || typeof productData.variants !== "object") {
      productData.variants = {};
    }
    
    // Ensure customizations is an array
    if (!productData.customizations || !Array.isArray(productData.customizations)) {
      productData.customizations = [];
    }
    
    const product = new ProductModel(productData);
    await product.save();
    res.sendSuccess(product, "Product created successfully");
  } catch (err) {
    res.sendError(err, "Error creating product", 500);
  }
});

// PUT /api/admin/products/:id - Update a product
router.put("/:id", async (req, res) => {
  try {
    const productData = req.body;
    
    // Prevent _id modification
    delete productData._id;
    delete productData.createdAt;
    
    // Ensure variants is an object
    if (productData.variants && typeof productData.variants !== "object") {
      productData.variants = {};
    }
    
    // Ensure customizations is an array
    if (productData.customizations && !Array.isArray(productData.customizations)) {
      productData.customizations = [];
    }
    
    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.sendError(null, "Product not found", 404);
    }
    
    res.sendSuccess(product, "Product updated successfully");
  } catch (err) {
    res.sendError(err, "Error updating product", 500);
  }
});

// DELETE /api/admin/products/:id - Delete a product
router.delete("/:id", async (req, res) => {
  try {
    const product = await ProductModel.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.sendError(null, "Product not found", 404);
    }
    res.sendSuccess(null, "Product deleted successfully");
  } catch (err) {
    res.sendError(err, "Error deleting product", 500);
  }
});

module.exports = router;
