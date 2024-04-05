const mongoose = require("mongoose");

const CompSchema = new mongoose.Schema({
  data: mongoose.Schema.Types.Mixed,
  compId: { type: Number, required: true, unique: true },
  compName: { type: String, required: true },
  compCode: { type: String, required: true ,  unique: true },
  compType: String,
  compSymb:  { type: String, required: true },
});

const Competition = mongoose.model("Competition", CompSchema);

module.exports = Competition;