const fetch = require("node-fetch").default;
const mongoose = require("mongoose");
const League = require("../models/League");
require("dotenv").config();

const apiKey = process.env.API_KEY;

var myHeaders = new Headers();
myHeaders.append("x-rapidapi-key", apiKey);
myHeaders.append("x-rapidapi-host", "v3.football.api-sports.io");

var requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

const apiUrl = "https://v3.football.api-sports.io/leagues?current=true";

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.on("error", (err) => {
  process.exit(1);
});

db.once("open", async () => {
  try {
    const response = await fetch(apiUrl, requestOptions);
    const newData = await response.json();

    const existingLeague = await League.findOne();

    if (existingLeague) {
      existingLeague.data = newData;
      await existingLeague.save();
    } else {
      const league = new League({
        data: newData,
      });
      await league.save();
    }

    console.log("League data stored in MongoDB successfully!");
  } catch (error) {
    console.error("Error fetching league data or storing in MongoDB:", error);
  } finally {
    mongoose.connection.close();
  }
});
