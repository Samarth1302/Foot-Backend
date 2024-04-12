const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const shopController = require("../controllers/shopController");

router.get("/products", authenticateToken, shopController.getAllProducts);
router.get("/image/:productId", authenticateToken, shopController.getImage);

module.exports = router;
