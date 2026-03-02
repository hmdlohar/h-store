const express = require("express");
const GiftShopModel = require("../../models/GiftShopModel");

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

const cleanPayload = (body = {}) => ({
  externalId: String(body.externalId || "").trim(),
  shopName: String(body.shopName || "").trim(),
  shopPersonName: String(body.shopPersonName || "").trim(),
  mobileNumber: String(body.mobileNumber || "").trim(),
  additionalMobileNumbers: normalizeStringList(body.additionalMobileNumbers),
  email: String(body.email || "").trim().toLowerCase(),
  additionalEmails: normalizeStringList(body.additionalEmails).map((item) =>
    item.toLowerCase(),
  ),
  photoLink: String(body.photoLink || "").trim(),
  websiteLink: String(body.websiteLink || "").trim(),
  additionalLinks: normalizeStringList(body.additionalLinks),
  source: body.source,
  status: body.status,
  statusMeta: String(body.statusMeta || "").trim(),
});

router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    const q = String(req.query.q || "").trim();
    const status = String(req.query.status || "").trim();

    if (status) {
      filter.status = status;
    }

    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { externalId: regex },
        { shopName: regex },
        { shopPersonName: regex },
        { mobileNumber: regex },
        { email: regex },
      ];
    }

    const [total, giftShops] = await Promise.all([
      GiftShopModel.countDocuments(filter),
      GiftShopModel.find(filter)
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
    ]);

    res.sendSuccess(
      {
        giftShops,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      "Gift shops fetched successfully",
    );
  } catch (err) {
    res.sendError(err, "Error fetching gift shops", 500);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const giftShop = await GiftShopModel.findById(req.params.id).exec();
    if (!giftShop) {
      return res.sendError(null, "Gift shop not found", 404);
    }
    res.sendSuccess(giftShop, "Gift shop fetched successfully");
  } catch (err) {
    res.sendError(err, "Error fetching gift shop", 500);
  }
});

router.post("/", async (req, res) => {
  try {
    const payload = cleanPayload(req.body);
    if (!payload.shopName) {
      return res.sendError("validationError", "Shop name is required", 400);
    }

    const giftShop = new GiftShopModel({
      ...payload,
      createdVia: "admin",
      createdBy: req.user?.username || "admin",
      updatedBy: req.user?.username || "admin",
    });

    if (req.body.comment) {
      giftShop.comments.push({
        comment: String(req.body.comment).trim(),
        createdBy: req.user?.username || "admin",
      });
    }

    await giftShop.save();
    res.sendSuccess(giftShop, "Gift shop created successfully");
  } catch (err) {
    if (err?.code === 11000) {
      return res.sendError("duplicateExternalId", "External ID already exists", 409);
    }
    res.sendError(err, "Error creating gift shop", 500);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const payload = cleanPayload(req.body);
    if (!payload.shopName) {
      return res.sendError("validationError", "Shop name is required", 400);
    }

    const giftShop = await GiftShopModel.findById(req.params.id).exec();
    if (!giftShop) {
      return res.sendError(null, "Gift shop not found", 404);
    }

    Object.assign(giftShop, payload, {
      updatedBy: req.user?.username || "admin",
    });

    await giftShop.save();
    res.sendSuccess(giftShop, "Gift shop updated successfully");
  } catch (err) {
    if (err?.code === 11000) {
      return res.sendError("duplicateExternalId", "External ID already exists", 409);
    }
    res.sendError(err, "Error updating gift shop", 500);
  }
});

router.post("/:id/comments", async (req, res) => {
  try {
    const comment = String(req.body.comment || "").trim();
    if (!comment) {
      return res.sendError("validationError", "Comment is required", 400);
    }

    const giftShop = await GiftShopModel.findById(req.params.id).exec();
    if (!giftShop) {
      return res.sendError(null, "Gift shop not found", 404);
    }

    giftShop.comments.push({
      comment,
      createdBy: req.user?.username || "admin",
    });
    giftShop.updatedBy = req.user?.username || "admin";

    await giftShop.save();
    res.sendSuccess(giftShop, "Comment added successfully");
  } catch (err) {
    res.sendError(err, "Error adding comment", 500);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const giftShop = await GiftShopModel.findByIdAndDelete(req.params.id).exec();
    if (!giftShop) {
      return res.sendError(null, "Gift shop not found", 404);
    }
    res.sendSuccess(null, "Gift shop deleted successfully");
  } catch (err) {
    res.sendError(err, "Error deleting gift shop", 500);
  }
});

module.exports = router;
