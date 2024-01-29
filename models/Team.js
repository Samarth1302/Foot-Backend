const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  data: mongoose.Schema.Types.Mixed,
  leagueId: Number,
});

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
