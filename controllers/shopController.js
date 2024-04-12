const Product = require("../models/Product");

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};
const getImage = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const image = product.img;
    res.json(image);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

module.exports = {
  getAllProducts,
  getImage,
};
