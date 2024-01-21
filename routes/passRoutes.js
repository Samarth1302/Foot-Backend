const express = require("express");
const router = express.Router();
const {
  forgotPassword,
  changePassword,
} = require("../controllers/passController");

router.post("/forgot", forgotPassword);

router.post("/change", changePassword);

module.exports = router;
