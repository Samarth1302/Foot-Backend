const mongoose = require("mongoose");

const leagueSchema = new mongoose.Schema({
  data: mongoose.Schema.Types.Mixed,
});

const League = mongoose.model("League", leagueSchema);

module.exports = League;
