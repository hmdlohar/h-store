const mongoose = require("mongoose");

const TraceRecordingSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    events: [mongoose.Schema.Types.Mixed], // RRweb event objects
    chunkIndex: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TraceRecording", TraceRecordingSchema);
