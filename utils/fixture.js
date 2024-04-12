/*{{url}}/v4/competitions- stored in db
[BSA,PL,ELC,FL1,BL1,SA,DED,PPL,PD] (league codes) [CL,CLI] (cup codes)
{{url}}/v4/competitions/__/matches --- daily fetch (12)
{{url}}/v4/competitions/__/scorers  --- daily fetch (12)
{{url}}/v4/competitions/[CL,CLI]/standings --- direct dynamic fetch (3)
{{url}}/v4/matches/ (ONLY DAY TO DAY BASIS) --- direct dynamic fetch (1) */

// const mongoose = require("mongoose");

const fetch = require("node-fetch");
require("dotenv").config();
const Competition = require("../models/Competition");

async function fetchData(url, headers = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        ...headers,
        "X-Auth-Token": process.env.DATAORG_TOKEN,
      },
    });

    if (response.status === 429) {
      return {
        error: true,
        message: "Request limit reached. Please wait and try again later.",
      };
    }

    if (!response.ok) {
      return {
        error: true,
        message: `HTTP error! status: ${response.status}`,
      };
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function fetchStandings(competitionCode) {
  const standingsUrl = `https://api.football-data.org/v4/competitions/${competitionCode}/standings`;
  return await fetchData(standingsUrl);
}

async function fetchMatchesForDate() {
  const matchesUrl = `https://api.football-data.org/v4/matches/`;
  try {
    const data = await fetchData(matchesUrl);
    return data;
  } catch (error) {
    console.error("Error fetching matches for date:", error);
  }
}

async function fetchStandingsForCups() {
  const cupCodes = ["CL", "CLI"];
  try {
    const standingsData = await Promise.all(cupCodes.map(fetchStandings));
    return standingsData;
  } catch (error) {
    console.error("Error fetching standings for cups:", error);
  }
}

async function fetchCompData(codes) {
  for (const code of codes) {
    const data = await fetchMatchesAndScorers(code);
    await Competition.findOneAndUpdate({ compCode: code }, data, {
      upsert: true,
    });
  }
}

async function fetchMatchesAndScorers(competitionCode) {
  //   const matchesUrl = `https://api.football-data.org/v4/competitions/${competitionCode}/matches`;
  const scorersUrl = `https://api.football-data.org/v4/competitions/${competitionCode}/scorers`;
  //   const matchesData = await fetchData(matchesUrl);
  const scorersData = await fetchData(scorersUrl);

  return { scorers: scorersData };
}

// async function fetchAndStoreCompetitions() {
//   try {
//     const response = await fetchData(
//       "https://api.football-data.org/v4/competitions"
//     );

//     if (!response || !Array.isArray(response.competitions)) {
//       console.error("Error: Competitions data is invalid.");
//       return;
//     }

//     for (const competition of response.competitions) {
//       const mappedCompetition = {
//         compId: competition.id,
//         compName: competition.name,
//         compNation: competition.area.name,
//         compCode: competition.code,
//         compSymb: competition.emblem,
//       };

//       await Competition.create(mappedCompetition, { timeout: 30000 });
//     }

//     console.log("Competitions data stored successfully.");
//   } catch (error) {
//     console.error("Error fetching and storing competitions data:", error);
//   }
// }

module.exports = {
  fetchCompData,
  fetchMatchesForDate,
  fetchStandingsForCups,
};
