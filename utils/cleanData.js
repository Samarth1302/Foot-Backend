const mongoose = require("mongoose");
const League = require("../models/League");
require("dotenv").config();

const leagueIds = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 39, 40, 61, 78, 94, 128, 135, 140, 142, 143, 253,
  307, 323,
];

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.on("error", (err) => {
  process.exit(1);
});

db.once("open", async () => {
  try {
    await League.updateMany(
      {},
      { $pull: { "data.response": { "league.id": { $nin: leagueIds } } } }
    );

    console.log("Database cleaned successfully!");
  } catch (error) {
    console.error("Error cleaning the database:", error);
  } finally {
    mongoose.connection.close();
  }
});
