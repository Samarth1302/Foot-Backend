const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  data: mongoose.Schema.Types.Mixed
});

const News = mongoose.model("News", newsSchema);

module.exports = News;
