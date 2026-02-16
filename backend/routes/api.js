const express = require("express");
const commonMw = require("../middlewares/commonMW");
const jwtService = require("../services/jwtService");
const public = require("./public");

const router = express.Router();

router.use(commonMw);
router.use("/v1/u-sync", require("./sync-provider"));
router.use("/public", public);
router.use("/products", require("./product"));
router.use("/order", require("./order"));
router.use("/reviews", require("./review"));
router.use(jwtService.jwt_MW);
router.use("/user", require("./user"));
router.use("/order", require("./order-authenticated"));

router.use("/admin", (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.sendError(
      "unauthorized",
      "You are not authorized to access this route",
    );
  }
  next();
});
router.use("/admin/orders", require("./admin/orders"));
router.use("/admin/products", require("./admin/products"));
router.use("/admin/upload", require("./admin/upload"));
router.use("/admin/reviews", require("./admin/reviews"));
router.use("/admin/insights", require("./admin/insights"));

router.get("/", (req, res) => {
  return res.send("Router is working.");
});

// router.use("/account",account);

module.exports = router;
