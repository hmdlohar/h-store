var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("User", UserSchema);
