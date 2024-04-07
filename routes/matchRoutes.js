const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchController");

router.get(
  "/:competitionCode/matches",
  matchController.getMatchesForCompetition
);
router.get(
  "/:competitionCode/scorers",
  matchController.getScorersForCompetition
);
router.get("/standings", matchController.getStandingsForCups);
router.get("/matches", matchController.getMatchesForDate);

module.exports = router;
