const mongoose = require("mongoose");

const TraceEventSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    type: { type: String, required: true }, // pageview, click, input, etc.
    path: String,
    data: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TraceEvent", TraceEventSchema);
