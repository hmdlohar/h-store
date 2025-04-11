const express = require('express')
const account = require('./account')
const commonMw = require('../middlewares/commonMW')
const jwtService = require('../services/jwtService')
const public = require('./public')

const router = express.Router();

router.use(commonMw);
router.use(jwtService.jwt_MW);

router.get("/",(req,res)=>{
  return res.send("Router is working.");
});

router.use("/account",account);
router.use("/public",public);

module.exports = router;
