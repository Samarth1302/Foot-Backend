const express = require("express");
const router = express.Router();
const League = require("../models/League");
const Team = require("../models/Team");
const Player = require("../models/Player");

router.get("/leagues", async (req, res) => {
  try {
    const leaguesData = await League.find({}, { _id: 0, "data.response": 1 });
    const transformedLeagues = leaguesData[0].data.response.map((league) => ({
      id: league.league.id,
      name: league.league.name,
      logo: league.league.logo,
      country: league.country.name,
    }));

    res.json(transformedLeagues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/leagues/:leagueId/teams", async (req, res) => {
  try {
    const leagueId = req.params.leagueId;
    const teamsData = await Team.find(
      { leagueId },
      { _id: 0, "data.response": 1 }
    );

    const transformedTeams = teamsData[0].data.response.map((team) => ({
      id: team.team.id,
      name: team.team.name,
      code: team.team.code,
      foundedYear: team.team.founded,
      logo: team.team.logo,
      venue: {
        name: team.venue.name,
        address: team.venue.address,
        city: team.venue.city,
        capacity: team.venue.capacity,
        grass: team.venue.grass,
        image: team.venue.image,
      },
    }));

    res.json(transformedTeams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/leagues/:leagueId/teams/:teamId", async (req, res) => {
  try {
    const leagueId = req.params.leagueId;
    const teamId = req.params.teamId;

    const teamsData = await Team.find(
      { leagueId },
      { _id: 0, "data.response": 1 }
    );

    const foundTeam = teamsData[0].data.response.find(
      (team) => team.team.id === parseInt(teamId)
    );

    if (!foundTeam) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    const venueInfo = foundTeam.venue;

    const transformedTeam = {
      id: foundTeam.team.id,
      name: foundTeam.team.name,
      code: foundTeam.team.code,
      foundedYear: foundTeam.team.founded,
      logo: foundTeam.team.logo,
      venue: {
        name: venueInfo.name,
        address: venueInfo.address,
        city: venueInfo.city,
        capacity: venueInfo.capacity,
        image: venueInfo.image,
      },
    };

    res.json(transformedTeam);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/leagues/:leagueId/teams/:teamId/players", async (req, res) => {
  try {
    const leagueId = req.params.leagueId;
    const teamId = req.params.teamId;

    const playersData = await Player.find({ leagueId });

    if (!playersData || playersData.length === 0 || !playersData[0].data) {
      return res.status(404).json({ error: "No players data found" });
    }

    const teamPlayers = playersData[0].data.filter((player) => {
      return player.statistics.some((stat) => {
        return stat.team && stat.team.id.toString() === teamId.toString();
      });
    });

    if (teamPlayers.length === 0) {
      return res.status(404).json({ error: "No players found for the team" });
    }

    const transformedPlayers = teamPlayers.map((player) => ({
      name: `${player.player.firstname} ${player.player.lastname}`,
      age: player.player.age,
      nationality: player.player.nationality,
      height: player.player.height,
      weight: player.player.weight,
      photo: player.player.photo,
      teamId: teamId,
    }));

    res.json(transformedPlayers);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
