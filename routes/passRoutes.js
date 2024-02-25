const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const {
  forgotPassword,
  changePassword,
} = require("../controllers/passController");

router.post("/forgot", forgotPassword);

router.post("/change", authenticateToken, changePassword);

module.exports = router;
