var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: function () {
      return new mongoose.Types.ObjectId();
    },
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: String,
  password: {
    type: String,
    required: true,
  },
  email: String,
  name: String,
  role: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // This should include ip, browser, os, device
  signupData: {
    type: Object,
  },
});

module.exports = mongoose.model("User", UserSchema);
