const express = require("express");
const GiftShopModel = require("../models/GiftShopModel");

const router = express.Router();

const normalizeStringList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

router.post("/", async (req, res) => {
  try {
    const payload = {
      shopName: String(req.body.shopName || "").trim(),
      shopPersonName: String(req.body.shopPersonName || "").trim(),
      mobileNumber: String(req.body.mobileNumber || "").trim(),
      additionalMobileNumbers: normalizeStringList(req.body.additionalMobileNumbers),
      email: String(req.body.email || "").trim().toLowerCase(),
      additionalEmails: normalizeStringList(req.body.additionalEmails).map((item) =>
        item.toLowerCase(),
      ),
      photoLink: String(req.body.photoLink || "").trim(),
      websiteLink: String(req.body.websiteLink || "").trim(),
      additionalLinks: normalizeStringList(req.body.additionalLinks),
      source: ["google-maps", "justdial", "manual", "other"].includes(req.body.source)
        ? req.body.source
        : "manual",
      status: "new",
      statusMeta: "",
      createdVia: "public-api",
      createdBy: "public-api",
      updatedBy: "public-api",
    };

    if (!payload.shopName) {
      return res.sendError("validationError", "Shop name is required", 400);
    }

    const giftShop = new GiftShopModel(payload);
    await giftShop.save();

    res.sendSuccess(
      {
        _id: giftShop._id,
        shopName: giftShop.shopName,
        status: giftShop.status,
      },
      "Gift shop created successfully",
    );
  } catch (err) {
    res.sendError(err, "Error creating gift shop", 500);
  }
});

module.exports = router;
