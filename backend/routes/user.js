const express = require("express");
const UserModel = require("../models/UserModel");
const Utils = require("../services/Utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.sendSuccess(req.user, "User data fetched successfully");
  } catch (ex) {
    res.sendError(ex, Utils.parseErrorString(ex));
  }
});

router.post("/", async (req, res) => {
  try {
    let objAccount = new AccountModel(req.body);
    await objAccount.save();
  } catch (ex) {
    res.sendError(ex, Utils.parseErrorString(ex));
  }
});

module.exports = router;
