const express = require("express");
const UserModel = require("../models/UserModel");
const Utils = require("../services/Utils");
const jwtService = require("../services/jwtService");
const config = require("../config");
const ProductModel = require("../models/ProductModel");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    let user = await UserModel.findOne({ username: req.body.username });

    if (user) {
      return res.sendError("userExists", "User already exists with username.");
    }

    user = new UserModel(req.body);
    user.username = user.username.toLowerCase();

    await user.save();
    return res.sendSuccess(user, "User registered Successfully");
  } catch (ex) {
    console.log(ex);
    res.sendError(ex, "Error occured while registration. ");
  }
});

router.post("/login", async (req, res) => {
  try {
    let user = await UserModel.findOne({
      username: req.body.username.toLowerCase(),
    });
    if (!user) {
      return res.sendError("userNotFound", "User not found");
    }

    if (user.password !== req.body.password) {
      return res.sendError("passwordMismatch", "You entered wrong password. ");
    }

    delete user.password;
    jwtService
      .authenticate(user)
      .then((token) => {
        return res.sendSuccess({ token: token, userData: user });
      })
      .catch((err) => {
        return res.sendError(err, "Problem in decoding token. ");
      });
    //return res.sendSuccess(user, "User logged Successfully");
  } catch (ex) {
    console.log(ex);
    res.sendError(ex, "Error occured while login. ");
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const axios = require("axios");
    const { accessToken } = req.body;

    const { data } = await axios.post(
      "https://control.msg91.com/api/v5/widget/verifyAccessToken",
      {
        authkey: config.MSG91_AUTH_KEY,
        "access-token": accessToken,
      }
    );

    if (data?.type !== "success") {
      return res.sendError("otpNotVerified", data.message);
    }
    const mobile = data.message;

    let user = await UserModel.findOne({ username: mobile });
    if (!user) {
      user = new UserModel({
        username: mobile,
        name: mobile,
        mobile,
        password: Date.now().toString(),
      });
      await user.save();
    }

    const token = await jwtService.authenticate(user);
    res.sendSuccess({ token, user: user }, "OTP verified successfully");
  } catch (ex) {
    console.log(ex);
    res.sendError(ex, "Error occured while verifying OTP. ");
  }
});

router.get("/home-page-config", async (req, res) => {
  const homePageConfig = require("../data/home-page-config");
  for (let item of homePageConfig) {
    if (item.type === "product") {
      item.data.product = await ProductModel.findOne({ slug: item.data.slug });
    } else if (item.type === "product-row") {
      item.data.products = await ProductModel.find({ isActive: true }).limit(4);
    }
  }
  res.sendSuccess(homePageConfig, "Home page config fetched successfully");
});

module.exports = router;
