const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  iName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  size: {
    type: [String],
  },
  offer: {
    type: Number,
  },
  type: {
    type: String,
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
