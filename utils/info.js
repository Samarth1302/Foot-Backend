const fetch = require("node-fetch");
const mongoose = require("mongoose");
const Team = require("../models/Team");
const Player = require("../models/Player");
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

async function getTeams(league, season) {
  const teams = await callApi("teams", { league, season });
  return teams;
}

async function getAllPlayers(league, season, page = 1, playersData = []) {
  const players = await callApi("players", { league, season, page });
  playersData = playersData.concat(players.response);

  if (players.paging.current < players.paging.total) {
    page = players.paging.current + 1;
    if (page % 2 === 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    playersData = await getAllPlayers(league, season, page, playersData);
  }

  return playersData;
}

async function storeTeamsDataInMongoDB(league, season) {
  try {
    const teamsData = await getTeams(league, season);

    if (teamsData.response.length > 0) {
      await Team.findOneAndUpdate(
        { leagueId: league },
        { data: teamsData },
        { upsert: true }
      );
    } else {
      console.log(
        `Teams data for league ${league} is empty, skipping database update.`
      );
    }
  } catch (error) {
    console.error("Error fetching or storing teams data:", error);
  }
}

async function storePlayersDataInMongoDB(league, season) {
  try {
    const playersData = await getAllPlayers(league, season);

    if (playersData.length > 0) {
      await Player.findOneAndUpdate(
        { leagueId: league },
        { data: playersData },
        { upsert: true }
      );
    } else {
      console.log(
        `Players data for league ${league} is empty, skipping database update.`
      );
    }
  } catch (error) {
    console.error("Error fetching or storing players data:", error);
  }
}

async function getInfo(leagueIds, seasonYear) {
  mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;

  db.on("error", (err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

  db.once("open", async () => {
    try {
      for (const leagueId of leagueIds) {
        await storeTeamsDataInMongoDB(leagueId, seasonYear);
        await storePlayersDataInMongoDB(leagueId, seasonYear);
      }
    } finally {
      console.log("Players,teams data stored in MongoDB successfully!");
      mongoose.connection.close();
    }
  });
}
// const seasonYear = 2023;
// const firstBatch = [
//   39, 40, 44, 61, 71, 78, 88, 94, 128, 135, 140, 142, 253, 254, 262, 307, 323,
// ];
// getInfo(firstBatch, seasonYear);

module.exports = {
  getInfo,
};
