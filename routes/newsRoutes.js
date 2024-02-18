const express = require("express");
const router = express.Router();
const News = require("../models/News");

router.get("/all", async (req, res) => {
  try {
    const news = await News.find().limit(30);
    res.json(news[0].data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
