const mongoose = require("mongoose");

const TraceSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userAgent: String,
    browser: String,
    os: String,
    device: String,
    ip: String,
    utm: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String,
    },
    screenWidth: Number,
    screenHeight: Number,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    initialHit: { type: Boolean, default: true },
    pageViews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TraceSession", TraceSessionSchema);
