const League = require("../models/League");
const Team = require("../models/Team");
const Player = require("../models/Player");
const Table = require("../models/Table");

const getLeagues = async (req, res) => {
  try {
    const leaguesData = await League.find({}, { _id: 0, data: 1 });

    const transformedLeagues = leaguesData[0].data.map((league) => ({
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
};

const getLeagueById = async (req, res) => {
  try {
    const leagueId = req.params.leagueId;

    const [leagueData, tablesData] = await Promise.all([
      League.aggregate([
        {
          $unwind: "$data",
        },
        {
          $match: {
            "data.league.id": parseInt(leagueId),
          },
        },
        {
          $replaceRoot: { newRoot: "$data" },
        },
      ]),
      Table.find({ leagueId }, { _id: 0, data: 1 }),
    ]);

    if (!leagueData.length) {
      return res.status(404).json({ error: "League not found" });
    }

    const league = leagueData[0];
    const teamsData = await Team.find(
      { leagueId: parseInt(leagueId) },
      { _id: 0, "data.response": 1 }
    );

    const transformedTeams = teamsData[0].data.response.map((team) => ({
      id: team.team.id,
      name: team.team.name,
      logo: team.team.logo,
    }));

    const transformedLeague = {
      id: league.league.id,
      name: league.league.name,
      logo: league.league.logo,
      country: league.country.name,
      teams: transformedTeams,
    };

    if (tablesData && tablesData.length > 0) {
      const responseData = tablesData[0].data;
      if (responseData) {
        const standingsData = responseData.response[0].league.standings[0];
        if (standingsData && standingsData.length > 0) {
          transformedLeague.standings = standingsData.map((teamData) => ({
            rank: teamData.rank,
            team: {
              id: teamData.team.id,
              name: teamData.team.name,
              logo: teamData.team.logo,
            },
            points: teamData.points,
            goalsDiff: teamData.goalsDiff,
            form: teamData.form,
            all: {
              played: teamData.all.played,
              win: teamData.all.win,
              draw: teamData.all.draw,
              lose: teamData.all.lose,
              goals: {
                for: teamData.all.goals ? teamData.all.goals.for : null,
                against: teamData.all.goals ? teamData.all.goals.against : null,
              },
            },
          }));
        }
      }
    }
    res.json(transformedLeague);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getTeamById = async (req, res) => {
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

    const tablesData = await Table.find({ leagueId }, { _id: 0, data: 1 });

    let standingsData = [];
    if (tablesData && tablesData.length > 0) {
      const responseData = tablesData[0].data;
      if (
        responseData &&
        responseData.response &&
        responseData.response.length > 0
      ) {
        const standings = responseData.response[0].league.standings[0];
        const teamStandings = standings.find(
          (teamData) => teamData.team.id === parseInt(teamId)
        );
        if (teamStandings) {
          standingsData.push({
            rank: teamStandings.rank,
            team: {
              id: teamStandings.team.id,
              name: teamStandings.team.name,
              logo: teamStandings.team.logo,
            },
            points: teamStandings.points,
            goalsDiff: teamStandings.goalsDiff,
            form: teamStandings.form,
            all: {
              played: teamStandings.all.played,
              win: teamStandings.all.win,
              draw: teamStandings.all.draw,
              lose: teamStandings.all.lose,
              goals: {
                for: teamStandings.all.goals
                  ? teamStandings.all.goals.for
                  : null,
                against: teamStandings.all.goals
                  ? teamStandings.all.goals.against
                  : null,
              },
            },
            home: {
              played: teamStandings.home.played,
              win: teamStandings.home.win,
              draw: teamStandings.home.draw,
              lose: teamStandings.home.lose,
              goals: {
                for: teamStandings.home.goals
                  ? teamStandings.home.goals.for
                  : null,
                against: teamStandings.home.goals
                  ? teamStandings.home.goals.against
                  : null,
              },
            },
            away: {
              played: teamStandings.away.played,
              win: teamStandings.away.win,
              draw: teamStandings.away.draw,
              lose: teamStandings.away.lose,
              goals: {
                for: teamStandings.away.goals
                  ? teamStandings.away.goals.for
                  : null,
                against: teamStandings.away.goals
                  ? teamStandings.away.goals.against
                  : null,
              },
            },
          });
        }
      }
    }

    const transformedTeam = {
      id: foundTeam.team.id,
      name: foundTeam.team.name,
      code: foundTeam.team.code,
      foundedYear: foundTeam.team.founded,
      country: foundTeam.team.country,
      logo: foundTeam.team.logo,
      venue: {
        name: venueInfo.name,
        address: venueInfo.address,
        city: venueInfo.city,
        capacity: venueInfo.capacity,
        image: venueInfo.image,
      },
      standings: standingsData,
    };

    res.json(transformedTeam);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getPlayers = async (req, res) => {
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
      name: player.player.name,
      firstname: player.player.firstname,
      lastname: player.player.lastname,
      age: player.player.age,
      nationality: player.player.nationality,
      height: player.player.height,
      weight: player.player.weight,
      photo: player.player.photo,
      position: player.statistics[0].games.position,
      teamId: teamId,
      playerId: player.player.id,
    }));

    res.json(transformedPlayers);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllTeams = async (req, res) => {
  try {
    const allTeamsData = await Team.find({}, { _id: 0 });

    if (!allTeamsData || allTeamsData.length === 0) {
      return res.status(404).json({ error: "No teams found" });
    }

    const allTeams = [];

    allTeamsData.forEach((teamDoc) => {
      const leagueId = teamDoc.leagueId;

      teamDoc.data.response.forEach((team) => {
        allTeams.push({
          id: team.team.id,
          name: team.team.name,
          logo: team.team.logo,
          leagueId: leagueId,
        });
      });
    });

    res.json(allTeams);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getLeagues,
  getPlayers,
  getTeamById,
  getLeagueById,
  getAllTeams,
};
