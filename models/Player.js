const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  data: mongoose.Schema.Types.Mixed,
  leagueId: Number,
});

const Player = mongoose.model("Player", playerSchema);

module.exports = Player;
