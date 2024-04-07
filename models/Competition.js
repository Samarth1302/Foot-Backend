const mongoose = require("mongoose");

const CompSchema = new mongoose.Schema({
  scorers: mongoose.Schema.Types.Mixed,
  matches: mongoose.Schema.Types.Mixed,
  compId: { type: Number, unique: true },
  compName: { type: String },
  compNation: { type: String },
  compCode: { type: String },
  compSymb: { type: String },
});

const Competition = mongoose.model("Competition", CompSchema);

module.exports = Competition;
