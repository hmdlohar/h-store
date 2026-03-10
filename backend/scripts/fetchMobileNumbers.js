const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from the parent directory's .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

const GiftShop = require("../models/GiftShopModel");

/**
 * Script to fetch GiftShop records where mobileNumber is numerically greater than 9.
 */
async function fetchGiftShops() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("Error: MONGO_URI is not defined in your .env file.");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected successfully.\n");

    // Fetch records where mobileNumber string length is > 9
    const giftShops = await GiftShop.find({
      $expr: {
        $gt: [{ $strLenCP: { $ifNull: ["$mobileNumber", ""] } }, 9]
      }
    }).select("shopName shopPersonName mobileNumber status");

    console.log(`Found ${giftShops.length} record(s) where mobileNumber > 9:`);
    console.log("---------------------------------------------------------");

    if (giftShops.length > 0) {
      giftShops.forEach((shop, index) => {
        console.log(`${(index + 1).toString().padStart(2, ' ')}. [${shop.shopName}] ${shop.shopPersonName || 'N/A'} - ${shop.mobileNumber}`);
      });
    } else {
      console.log("No matching records found.");
    }

  } catch (error) {
    console.error("An error occurred:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
    process.exit(0);
  }
}

fetchGiftShops();
