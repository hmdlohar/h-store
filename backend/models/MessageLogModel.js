const mongoose = require("mongoose");

const MessageLogSchema = new mongoose.Schema({
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
  to: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  info: {
    type: Object,
    default: {},
  },
  status: {
    type: String,
    default: "pending", // pending, sent, failed
  },
  error: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MessageLog", MessageLogSchema);
