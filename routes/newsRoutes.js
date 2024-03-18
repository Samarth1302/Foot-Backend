const express = require("express");
const router = express.Router();
const News = require("../models/News");

router.get("/all", async (req, res) => {
  try {
    const news = await News.aggregate([
      { $unwind: "$data" },
      { $group: { _id: "$data.url", data: { $first: "$$ROOT.data" } } },
      { $replaceRoot: { newRoot: "$data" } },
      { $sort: { publishedAt: -1 } },
      { $limit: 30 },
    ]);
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
