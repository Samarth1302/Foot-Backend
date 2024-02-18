const fetch = require("node-fetch");
const mongoose = require("mongoose");
const Player = require("../models/Player");
require("dotenv").config();

const apiKey = process.env.API_KEY;

const headers = {
  "x-rapidapi-key": apiKey,
  "x-rapidapi-host": "v3.football.api-sports.io",
};

const apiUrl = "https://v3.football.api-sports.io/";

async function getPlayers(league, season, startPage = 1, playersData = []) {
  try {
    const url = `${apiUrl}players?league=${league}&season=${season}&page=${startPage}`;
    const response = await fetch(url, { method: "GET", headers });
    const data = await response.json();

    if (data.response.length === 0) {
      console.log(`No players received in page ${startPage}`);
      return playersData;
    }

    playersData = playersData.concat(data.response);

    const totalPages = data.paging.total;
    for (let page = startPage; page <= totalPages; page++) {
      const nextPageUrl = `${apiUrl}players?league=${league}&season=${season}&page=${page}`;
      const nextPageResponse = await fetch(nextPageUrl, {
        method: "GET",
        headers,
      });
      const nextPageData = await nextPageResponse.json();

      if (nextPageData.response.length === 0) {
        console.log(`No players received in page ${page}`);
        break;
      }

      playersData = playersData.concat(nextPageData.response);
      console.log(
        `Received ${nextPageData.response.length} players in page ${page}`
      );
    }
  } catch (error) {
    console.error("Error fetching players data:", error);
  }

  return playersData;
}

async function storePlayersDataInMongoDB(league, season) {
  try {
    const playersData = await getPlayers(league, season);

    console.log(`Total players received: ${playersData.length}`);

    if (playersData.length > 0) {
      await Player.findOneAndUpdate(
        { leagueId: league },
        { data: playersData },
        { upsert: true }
      );
      console.log(`Players data stored in MongoDB for league ${league}`);
    } else {
      console.log(
        `Players data for league ${league} is empty, skipping database update.`
      );
    }
  } catch (error) {
    console.error("Error fetching or storing players data:", error);
  }
}

async function playerInfo(leagueIds, seasonYear) {
  mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;

  db.on("error", (err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

  db.once("open", async () => {
    try {
      for (const leagueId of leagueIds) {
        await storePlayersDataInMongoDB(leagueId, seasonYear);
      }
    } finally {
      console.log("Players,teams data stored in MongoDB successfully!");
      mongoose.connection.close();
    }
  });
}

const seasonYear = 2023;
const firstBatch = [39];
playerInfo(firstBatch, seasonYear);

module.exports = {
  playerInfo,
};
// 39, 40, 44, 61, 71, 78, 88, 94, 128, 135, 140, 142, 253, 254, 262, 307, 323,
