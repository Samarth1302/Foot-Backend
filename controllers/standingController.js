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

async function getLeagues() {
  const leagues = await callApi("leagues", { current: true });
  return leagues;
}

async function getStandings(league, season) {
  const standings = await callApi("standings", { league, season });
  return standings;
}

async function storeStandingsDataInMongoDB(leagueId, season) {
  try {
    const leagues = await getLeagues();
    const leaguesForStandings = leagues.response.filter(
      (league) => league.seasons[0].coverage.standings === "true"
    );

    const league = leaguesForStandings.find(
      (league) => league.league.id === leagueId
    );

    if (league) {
      const standingsData = await getStandings(league.league.id, season);

      const standingsModel = new Table({
        data: standingsData,
        leagueId: league.league.id,
      });
      await standingsModel.save();

      console.log("Standings data stored in MongoDB successfully!");
    } else {
      console.error("No league found with ID:", leagueId);
    }
  } catch (error) {
    console.error("Error fetching or storing standings data:", error);
  }
}

const leagueIds = [39, 40, 61, 78, 94, 128, 135, 140, 142, 143, 253, 307, 323];
const seasonYear = 2023;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
const db = mongoose.connection;

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

db.once("open", async () => {
  for (const leagueId of leagueIds) {
    await storeStandingsDataInMongoDB(leagueId, seasonYear);
  }
  mongoose.connection.close();
});
