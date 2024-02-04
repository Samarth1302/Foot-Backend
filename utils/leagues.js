const fetch = require("node-fetch").default;
const mongoose = require("mongoose");
const League = require("../models/League");
require("dotenv").config();

const apiKey = process.env.API_KEY;

const headers = new Headers();
headers.append("x-rapidapi-key", apiKey);
headers.append("x-rapidapi-host", "v3.football.api-sports.io");

const requestOptions = {
  method: "GET",
  headers: headers,
  redirect: "follow",
};

const apiUrl = "https://v3.football.api-sports.io/leagues?current=true";

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.on("error", (err) => {
  process.exit(1);
});

const fetchDataCleanAndStoreInMongo = async () => {
  try {
    const response = await fetch(apiUrl, requestOptions);
    const newData = await response.json();

    const tempData = new League({
      data: newData,
    });
    await tempData.save();

    const leagueIds = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 39, 40, 61, 78, 94, 128, 135, 140, 142, 143,
      253, 307, 323,
    ];

    await League.updateMany(
      { _id: tempData._id },
      { $pull: { "data.response": { "league.id": { $nin: leagueIds } } } }
    );
    const cleanedData = await League.findById(tempData._id);

    const existingLeague = await League.findOne();

    if (existingLeague) {
      existingLeague.data = cleanedData.data;
      await existingLeague.save();
    } else {
      const league = new League({
        data: cleanedData.data,
      });
      await league.save();
    }

    console.log("League data cleaned and stored in MongoDB successfully!");
  } catch (error) {
    console.error(
      "Error fetching, cleaning, or storing data in MongoDB:",
      error
    );
  } finally {
    mongoose.connection.close();
  }
};
module.exports = {
  fetchDataCleanAndStoreInMongo,
};
