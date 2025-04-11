const express = require('express')
const AccountModel = require('../models/AccountModel')
const Utils = require('../services/Utils')

const router = express.Router();

router.get("/", async (req, res) => {
 let accounts = await AccountModel.list({})
 res.send(accounts);
});


router.post("/", async (req, res) => {
  try{
    let objAccount = new AccountModel(req.body);
    objAccount.username = req.userData.user.username;
    await objAccount.save();
    res.sendSuccess("accountAdded","Account Added Successfully. ")
  }
  catch(ex){
    res.sendError(ex, Utils.parseErrorString(ex));
  }
});


module.exports = router;
