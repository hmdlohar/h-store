const express = require('express')
const commonMw = require('../middlewares/commonMW')
const jwtService = require('../services/jwtService')
const public = require('./public')

const router = express.Router();

router.use(commonMw);
router.use("/public",public);
router.use('/products', require('./product'));
router.use(jwtService.jwt_MW);
router.use('/user', require('./user'));
router.use('/order', require('./order'));

router.get("/",(req,res)=>{
  return res.send("Router is working.");
});

// router.use("/account",account);


module.exports = router;
