const NewsAPI = require('newsapi');
const mongoose = require('mongoose');
const News = require('../models/News');
require('dotenv').config();
const newsapi = new NewsAPI('02af91350030400a8a080ff584a98c1d');

const fetchAndStoreFootballNews = async () => {
  mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
  try {
    const response = await newsapi.v2.everything({
      q: 'football OR soccer AND (premier league OR la liga OR champions league OR bundesliga OR ligue 1 OR serie a OR saudi league OR mls)',
      sources: 'espn.in, skysports.com, goal.com, theguardian.com, bbc.com, eurosport.com, football365.com, teamtalk.com, sportskeeda.com, sports.ndtv.com, onefootball.com, talksport, skysports, fox-sports, bleacher-report',
      language: 'en',
      sortBy: 'publishedAt',
      page: 1,
    });

    const existingNews = await News.findOne();

    if (existingNews) {
     
      existingNews.data = response.articles;
      await existingNews.save();
      console.log('Existing news data replaced in db successfully!');
    } else {
      const news = new News({
        data: response.articles,
      });
      await news.save();
      console.log('News data stored in database successfully!');
    }
  } catch (error) {
    console.error('Error fetching or storing data in MongoDB:', error);
  } finally {
    mongoose.connection.close();
  }
};

module.exports = {
  fetchAndStoreFootballNews,
};
