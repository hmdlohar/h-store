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
    // IP Geolocation fields
    ipInfo: {
      city: String,
      region: String,
      country: String,
      countryCode: String,
      continentCode: String,
      latitude: Number,
      longitude: Number,
      timezone: String,
      org: String,
      asn: String,
      ipVersion: Number,
    },
    ipInfoFetchedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("TraceSession", TraceSessionSchema);
