const News = require("../models/News");
const NewsAPI = require("newsapi");
require("dotenv").config();
const newsapi = new NewsAPI("02af91350030400a8a080ff584a98c1d");

const fetchAndStoreFootballNews = async () => {
  try {
    const response = await newsapi.v2.everything({
      q: "(soccer OR football) AND (premier league OR la liga OR champions league OR bundesliga OR ligue 1 OR serie a OR saudi pro league OR major league soccer OR europa league OR fifa) -american",
      sources:
        "bbc-sport,espn,the-sport-bible,sky-sports,goal,the-guardian,eurosport,lequipe,football365,teamtalk,sports-keeda,marca,four-four-two,talksport,bleacher-report,mirror-football,ft-football,daily-mail,football-italia,fox-sports",
      language: "en",
      sortBy: "publishedAt",
      pageSize: 100,
    });

    const allArticles = response.articles;

    const filteredArticles = allArticles.filter(
      (article) =>
        !/nfl|super\s*bowl/i.test(article.url) &&
        !/nfl|super\s*bowl/i.test(article.content)
    );

    filteredArticles.sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    const recentArticles = filteredArticles.slice(0, 30);

    const existingNews = await News.findOne().sort({ createdAt: -1 });

    if (existingNews) {
      const existingUrls = existingNews.data.map((article) => article.url);
      const uniqueArticles = recentArticles.filter(
        (article) => !existingUrls.includes(article.url)
      );

      const updatedData = uniqueArticles.concat(existingNews.data);

      existingNews.data = updatedData.slice(0, 30);

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
  }
};

module.exports = {
  fetchAndStoreFootballNews,
};
