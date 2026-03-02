const mongoose = require("mongoose");

const GiftShopCommentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: String,
      default: "system",
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const GiftShopSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      trim: true,
      default: "",
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    shopPersonName: {
      type: String,
      default: "",
      trim: true,
    },
    mobileNumber: {
      type: String,
      default: "",
      trim: true,
    },
    additionalMobileNumbers: {
      type: [String],
      default: [],
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    additionalEmails: {
      type: [String],
      default: [],
    },
    photoLink: {
      type: String,
      default: "",
      trim: true,
    },
    websiteLink: {
      type: String,
      default: "",
      trim: true,
    },
    additionalLinks: {
      type: [String],
      default: [],
    },
    addressLine1: {
      type: String,
      default: "",
      trim: true,
    },
    addressLine2: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    zipCode: {
      type: String,
      default: "",
      trim: true,
    },
    source: {
      type: String,
      enum: ["google-maps", "justdial", "manual", "other"],
      default: "manual",
    },
    status: {
      type: String,
      enum: [
        "new",
        "crm",
        "call_attempted",
        "interested",
        "not_interested",
        "positive_review",
        "follow_up",
        "closed",
      ],
      default: "new",
    },
    statusMeta: {
      type: String,
      default: "",
      trim: true,
    },
    comments: {
      type: [GiftShopCommentSchema],
      default: [],
    },
    createdVia: {
      type: String,
      enum: ["admin", "public-api"],
      default: "admin",
    },
    createdBy: {
      type: String,
      default: "",
      trim: true,
    },
    updatedBy: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

GiftShopSchema.index({ shopName: 1 });
GiftShopSchema.index({ status: 1, createdAt: -1 });
GiftShopSchema.index(
  { externalId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { externalId: { $type: "string", $ne: "" } },
  },
);

module.exports = mongoose.model("GiftShop", GiftShopSchema);
