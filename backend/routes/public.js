const express = require('express')
const UserModel = require('../models/UserModel')
const Utils = require('../services/Utils')
const jwtService = require('../services/jwtService')

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    let user = await UserModel.findOne({ username: req.body.username });

    if (user) {
      return res.sendError("userExists", "User already exists with username.");
    }

    user = new UserModel(req.body);
    user.username = user.username.toLowerCase();

    await user.save();
    return res.sendSuccess(user, "User registered Successfully");
  }
  catch (ex) {
    console.log(ex);
    res.sendError(ex, "Error occured while registration. ");
  }
});

router.post('/login', async (req, res) => {
  try {
    let user = await UserModel.findOne({ username: req.body.username.toLowerCase() });
    if (!user) {
      return res.sendError("userNotFound", "User not found");
    }

    if (user.password !== req.body.password) {
      return res.sendError("passwordMismatch", "You entered wrong password. ");
    }

    delete user.password;
    jwtService.authenticate( user)
      .then(token => {
        return res.sendSuccess({ token: token, userData: user });
      })
      .catch(err => {
        return res.sendError(err, "Problem in decoding token. ");
      });
    //return res.sendSuccess(user, "User logged Successfully");
  }
  catch (ex) {
    console.log(ex);
    res.sendError(ex, "Error occured while login. ");
  }
});


module.exports = router;
