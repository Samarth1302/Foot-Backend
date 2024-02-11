const fetch = require("node-fetch").default;
const mongoose = require("mongoose");
const League = require("../models/League");
require("dotenv").config();

const apiKey = process.env.API_KEY;

const apiUrl = "https://v3.football.api-sports.io/leagues";
const headers = {
  "x-rapidapi-host": "v3.football.api-sports.io",
  "x-rapidapi-key": apiKey,
};

const requestOptions = {
  method: "GET",
  headers: headers,
  redirect: "follow",
};

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.on("error", (err) => {
  process.exit(1);
});

const fetchDataCleanAndStoreInMongo = async () => {
  try {
    const response = await fetch(apiUrl, requestOptions);
    const newData = await response.json();

    const leagueIds = [
      39, 40, 44, 61, 71, 78, 88, 94, 128, 135, 140, 142, 253, 254, 262, 307,
      323,
    ];
    const season = 2023;

    const filteredLeagues = newData.response.filter(
      (league) =>
        leagueIds.includes(league.league.id) &&
        league.seasons.some((season) => season.year === season)
    );

    const existingLeague = await League.findOne();

    if (existingLeague) {
      existingLeague.data = filteredLeagues;
      await existingLeague.save();
      console.log("Existing league data updated in MongoDB successfully!");
    } else {
      const league = new League({
        data: filteredLeagues,
      });
      await league.save();
      console.log("New league data stored in MongoDB successfully!");
    }
  } catch (error) {
    console.error(
      "Error fetching, cleaning, or storing data in MongoDB:",
      error
    );
  } finally {
    mongoose.connection.close();
  }
};

fetchDataCleanAndStoreInMongo();
module.exports = {
  fetchDataCleanAndStoreInMongo,
};
