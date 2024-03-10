const NewsAPI = require("newsapi");
const mongoose = require("mongoose");
const News = require("../models/News");
require("dotenv").config();
const newsapi = new NewsAPI("02af91350030400a8a080ff584a98c1d");

const fetchAndStoreFootballNews = async () => {
  mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;

  db.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  try {
    const response = await newsapi.v2.everything({
      q: "(soccer OR football) AND (premier league OR la liga OR champions league OR bundesliga OR ligue 1 OR serie a OR saudi pro league OR major league soccer OR europa league OR fifa) -american",
      sources:
        "espn, skysports, goal, theguardian, bbc, eurosport, football365, teamtalk, sportskeeda, sports.ndtv, onefootball, fourfourtwo, talksport, bleacher-report, guardian-sport, mirror-football, ft-football, daily-mail",
      language: "en",
      sortBy: "publishedAt",
      pageSize: 100,
    });

    const allArticles = response.articles;

    const filteredArticles = allArticles
      .filter(
        (article) =>
          !/nfl|super\s*bowl/i.test(article.url) &&
          !/nfl|super\s*bowl/i.test(article.content)
      )
      .map(({ content, ...rest }) => rest);

    filteredArticles.sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    const recentArticles = filteredArticles.slice(0, 30);

    const existingNews = await News.findOne().sort({ createdAt: -1 });

    if (existingNews) {
      if (recentArticles.length < 30) {
        const remainingCount = 30 - recentArticles.length;
        const additionalArticles = existingNews.data.slice(0, remainingCount);
        recentArticles = recentArticles.concat(additionalArticles);
      }
      existingNews.data = recentArticles;
      await existingNews.save();
    } else {
      const news = new News({
        data: recentArticles,
      });
      await news.save();
    }
    console.log("News data updated successfully.");
  } catch (error) {
    console.error("Error fetching or storing data in MongoDB:", error);
  } finally {
    mongoose.connection.close();
  }
};
module.exports = {
  fetchAndStoreFootballNews,
};
