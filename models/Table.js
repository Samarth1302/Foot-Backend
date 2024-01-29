const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  data: mongoose.Schema.Types.Mixed,
  leagueId: Number,
});

const Table = mongoose.model("Table", tableSchema);

module.exports = Table;
