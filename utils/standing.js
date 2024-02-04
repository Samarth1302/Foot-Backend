const fetch = require("node-fetch");
const mongoose = require("mongoose");
const Table = require("../models/Table");
require("dotenv").config();

const apiKey = process.env.API_KEY;

const headers = {
  "x-rapidapi-key": apiKey,
  "x-rapidapi-host": "v3.football.api-sports.io",
};

const apiUrl = "https://v3.football.api-sports.io/";

async function callApi(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = apiUrl + endpoint + (queryString ? `?${queryString}` : "");

  const response = await fetch(url, { method: "GET", headers });
  const data = await response.json();

  return data;
}

async function getStandings(leagueId, season) {
  try {
    const standingsData = await callApi("standings", {
      league: leagueId,
      season,
    });
    return standingsData;
  } catch (error) {
    console.error("Error fetching standings data:", error);
    throw error;
  }
}

async function storeStandingsDataInMongoDB(leagueId, season) {
  try {
    const existingStandings = await Table.findOne({ leagueId });

    const standingsData = await getStandings(leagueId, season);

    if (standingsData.response) {
      if (existingStandings) {
        existingStandings.data = standingsData;
        await existingStandings.save();
      } else {
        const standingsModel = new Table({
          data: standingsData,
          leagueId: leagueId,
        });
        await standingsModel.save();
      }

      console.log("Standings data stored in MongoDB successfully!");
    } else {
      console.error("No standings data found for league with ID:", leagueId);
    }
  } catch (error) {
    console.error("Error storing standings data in MongoDB:", error);
  }
}

async function connectAndPerformDbOperations(leagueIds, seasonYear) {
  mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;

  db.on("error", (err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

  db.once("open", async () => {
    try {
      for (const leagueId of leagueIds) {
        await storeStandingsDataInMongoDB(leagueId, seasonYear);
      }
    } finally {
      mongoose.connection.close();
    }
  });
}

module.exports = {
  connectAndPerformDbOperations,
};
