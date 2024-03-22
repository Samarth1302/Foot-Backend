const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const shopController = require("../controllers/shopController");

router.get("/products", shopController.getAllProducts);

module.exports = router;
