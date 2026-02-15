const express = require("express");
const UserModel = require("../models/UserModel");
const Utils = require("../services/Utils");
const jwtService = require("../services/jwtService");
const config = require("../config");
const ProductModel = require("../models/ProductModel");
const postHog = require("../services/PostHogService");

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
    
    // Link anonymous ID to new user ID
    if (req.distinctId && req.distinctId !== user._id.toString()) {
      postHog.capture("$create_alias", {
        distinct_id: user._id.toString(),
        alias: req.distinctId,
      });
    }
    
    postHog.identify(user._id.toString(), {
      username: user.username,
      mobile: user.mobile,
      name: user.name,
      registration_method: "password",
      anonymous_id: req.distinctId,
    });
    
    postHog.trackUserEvent(user._id.toString(), "user_registered", {
      username: user.username,
      has_mobile: !!user.mobile,
      anonymous_id: req.distinctId,
    });
    
    return res.sendSuccess(user, "User registered Successfully");
  } catch (ex) {
    console.log(ex);
    postHog.trackError(ex, { route: "POST /public/register", distinct_id: req.distinctId });
    res.sendError(ex, "Error occured while registration. ");
  }
});

router.post("/login", async (req, res) => {
  try {
    let user = await UserModel.findOne({
      username: req.body.username.toLowerCase(),
    });
    if (!user) {
      postHog.capture("login_failed", {
        username: req.body.username,
        reason: "user_not_found",
        distinct_id: req.distinctId,
      });
      return res.sendError("userNotFound", "User not found");
    }

    if (user.password !== req.body.password) {
      postHog.trackUserEvent(req.distinctId || user._id.toString(), "login_failed", {
        username: user.username,
        reason: "wrong_password",
        user_id: user._id.toString(),
      });
      return res.sendError("passwordMismatch", "You entered wrong password. ");
    }

    delete user.password;
    jwtService
      .authenticate(user)
      .then((token) => {
        // Link anonymous ID to user ID on login
        if (req.distinctId && req.distinctId !== user._id.toString()) {
          postHog.capture("$create_alias", {
            distinct_id: user._id.toString(),
            alias: req.distinctId,
          });
        }
        
        postHog.trackUserEvent(user._id.toString(), "user_login", {
          username: user.username,
          login_method: "password",
          anonymous_id: req.distinctId,
        });
        return res.sendSuccess({ token: token, userData: user });
      })
      .catch((err) => {
        postHog.trackError(err, { route: "POST /public/login", user_id: user._id, distinct_id: req.distinctId });
        return res.sendError(err, "Problem in decoding token. ");
      });
    //return res.sendSuccess(user, "User logged Successfully");
  } catch (ex) {
    console.log(ex);
    postHog.trackError(ex, { route: "POST /public/login", distinct_id: req.distinctId });
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
      postHog.capture("otp_verification_failed", {
        reason: data.message,
        distinct_id: req.distinctId,
      });
      return res.sendError("otpNotVerified", data.message);
    }
    const mobile = data.message;

    let user = await UserModel.findOne({ username: mobile });
    let isNewUser = false;
    if (!user) {
      user = new UserModel({
        username: mobile,
        name: mobile,
        mobile,
        password: Date.now().toString(),
      });
      await user.save();
      isNewUser = true;
    }

    const token = await jwtService.authenticate(user);
    
    // Link anonymous ID to user ID
    if (req.distinctId && req.distinctId !== user._id.toString()) {
      postHog.capture("$create_alias", {
        distinct_id: user._id.toString(),
        alias: req.distinctId,
      });
    }
    
    postHog.identify(user._id.toString(), {
      username: user.username,
      mobile: user.mobile,
      name: user.name,
      registration_method: "otp",
      anonymous_id: req.distinctId,
    });
    
    postHog.trackUserEvent(user._id.toString(), isNewUser ? "user_registered" : "user_login", {
      username: user.username,
      mobile: user.mobile,
      method: "otp",
      is_new_user: isNewUser,
      anonymous_id: req.distinctId,
    });
    
    res.sendSuccess({ token, user: user }, "OTP verified successfully");
  } catch (ex) {
    console.log(ex);
    postHog.trackError(ex, { route: "POST /public/verify-otp", distinct_id: req.distinctId });
    res.sendError(ex, "Error occured while verifying OTP. ");
  }
});

router.get("/home-page-config", async (req, res) => {
  const homePageConfig = require("../data/home-page-config");
  for (let item of homePageConfig) {
    if (item.type === "product") {
      item.data.product = await ProductModel.findOne({ slug: item.data.slug });
    } else if (item.type === "product-row") {
      item.data.products = await ProductModel.find({ isActive: true }).limit(10);
    }
  }
  res.sendSuccess(homePageConfig, "Home page config fetched successfully");
});

module.exports = router;
