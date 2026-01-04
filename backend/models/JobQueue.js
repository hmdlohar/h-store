var mongoose = require("mongoose");

var JobQueueSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: function () {
      return new mongoose.Types.ObjectId();
    },
  },
  type: {
    type: String,
    required: true,
  },
  context: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    default: "pending", // pending, processing, completed, failed
  },
  error: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("job-queue", JobQueueSchema);
