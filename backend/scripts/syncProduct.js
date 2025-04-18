// Suggested code may be subject to a license. Learn more: ~LicenseLog:443330590.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:1608356542.
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("../models/ProductModel");
const dotenv = require("dotenv");
dotenv.config();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    syncProducts();
  })
  .catch((err) => console.error("Could not connect to MongoDB:", err));

const syncProducts = async () => {
  const productsDir = path.join(__dirname, "../data/products");
  try {
    const files = await fs.promises.readdir(productsDir);
    for (const file of files) {
      if (path.extname(file) === ".js") {
        const filePath = path.join(productsDir, file);
        const product = require(filePath);

        await updateProduct(product);

        console.log(`Synced products from ${file}`);
      }
    }
    console.log("Product synchronization complete.");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error during product synchronization:", error);
    mongoose.connection.close();
  }
};

const updateProduct = async (productData) => {
  try {
    const { slug, ...updateData } = productData;
    const product = await Product.findOneAndUpdate({ slug: slug }, updateData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  } catch (error) {
    console.error(`Error updating product ${productData.id}:`, error);
  }
};
