const fetch = require("node-fetch");
const Table = require("../models/Table");
require("dotenv").config();

const apiKey = process.env.API_KEY;
const apiUrl = "https://v3.football.api-sports.io/";

async function callApi(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = apiUrl + endpoint + (queryString ? `?${queryString}` : "");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "v3.football.api-sports.io",
    },
  });
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
    } else {
      console.error("No standings data found for league with ID:", leagueId);
    }
  } catch (error) {
    console.error("Error storing standings data in MongoDB:", error);
    throw error;
  }
}

async function performOps(leagueIds, seasonYear) {
  try {
    for (const leagueId of leagueIds) {
      await storeStandingsDataInMongoDB(leagueId, seasonYear);
    }
    console.log("Standings updated successfully.");
  } catch (error) {
    console.error("Error in performOps function:", error);
    throw error;
  }
}
module.exports = {
  performOps,
};
