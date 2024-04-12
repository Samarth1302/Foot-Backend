const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchController");

router.get(
  "/competitions",
  matchController.getCompetitions
);
router.get(
  "/:competitionId/matches",
  matchController.getMatchesForCompetition
);
router.get(
  "/:competitionId/scorers",
  matchController.getScorersForCompetition
);
router.get("/standings", matchController.getStandingsForCups);
router.get("/matches", matchController.getMatchesForDate);

module.exports = router;
