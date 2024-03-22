const express = require("express");
const router = express.Router();
const infoController = require("../controllers/infoController");

router.get("/leagues", infoController.getLeagues);

router.get("/leagues/:leagueId", infoController.getLeagueById);

router.get("/leagues/:leagueId/teams/:teamId", infoController.getTeamById);

router.get(
  "/leagues/:leagueId/teams/:teamId/players",
  infoController.getPlayers
);

router.get("/teams/all", infoController.getAllTeams);

module.exports = router;
