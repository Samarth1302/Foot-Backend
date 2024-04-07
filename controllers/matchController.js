const Competition = require("../models/Competition");
const {
  fetchMatchesForDate,
  fetchStandingsForCups,
} = require("../utils/fixture");
const NodeCache = require("node-cache");
const cache = new NodeCache();
const CACHE_TTL = 600;

async function getScorersForCompetition(req, res) {
  const { competitionCode } = req.params;

  try {
    const competition = await Competition.findOne({
      compCode: competitionCode,
    });

    if (!competition) {
      return res.status(404).json({ message: "Competition not found." });
    }

    const { compId, compName, compNation, compSymb, scorers } = competition;

    const formattedScorers = scorers.scorers.map((scorer) => ({
      name: `${scorer.player.firstName} ${scorer.player.lastName}`,
      nationality: scorer.player.nationality,
      section: scorer.player.section,
      team: {
        name: scorer.team.name,
        crest: scorer.team.crest,
      },
      playedMatches: scorer.playedMatches,
      goals: scorer.goals || 0,
      assists: scorer.assists || 0,
      penalties: scorer.penalties || 0,
    }));

    const responseData = {
      competition: {
        compId,
        compName,
        compNation,
        compSymb,
      },
      scorers: formattedScorers,
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching scorers for competition:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getMatchesForCompetition(req, res) {
  const { competitionCode } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const competition = await Competition.findOne({
      compCode: competitionCode,
    });

    if (!competition) {
      return res.status(404).json({ message: "Competition not found." });
    }

    const { compId, compName, compNation, compSymb, matches } = competition;

    const filteredMatches = matches.matches.filter((match) => {
      const matchDate = new Date(match.utcDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return matchDate >= start && matchDate <= end;
    });

    const formattedMatches = filteredMatches.map((match) => {
      return {
        homeTeam: {
          name: match.homeTeam.name,
          crest: match.homeTeam.crestUrl,
        },
        awayTeam: {
          name: match.awayTeam.name,
          crest: match.awayTeam.crestUrl,
        },
        utcDate: match.utcDate,
        score: {
          winner: match.score.winner,
          fullTime: match.score.fullTime,
          halfTime: match.score.halfTime,
        },
      };
    });

    const responseData = {
      competition: {
        compId,
        compName,
        compNation,
        compSymb,
      },
      matches: formattedMatches,
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching matches for competition:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getStandingsForCups(req, res) {
  try {
    const cachedData = cache.get("standingsForCups");
    if (cachedData) {
      return res.json(cachedData);
    }

    const standingsData = await fetchStandingsForCups();
    const formattedData = standingsData.map((group) => ({
      area: {
        name: group.area.name,
        flag: group.area.flag,
      },
      competition: {
        name: group.competition.name,
        emblem: group.competition.emblem,
      },
      season: {
        startDate: group.season.startDate,
        endDate: group.season.endDate,
      },
      standings: group.standings.map((standing) => ({
        stage: standing.stage,
        group: standing.group,
        teams: standing.table.map((team) => ({
          name: team.team.name,
          crest: team.team.crest,
          playedGames: team.playedGames,
          won: team.won,
          draw: team.draw,
          lost: team.lost,
          points: team.points,
          goalsFor: team.goalsFor,
          goalsAgainst: team.goalsAgainst,
          goalDifference: team.goalDifference,
        })),
      })),
    }));
    cache.set("standingsForCups", formattedData, CACHE_TTL);
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getMatchesForDate(req, res) {
  try {
    const cachedData = cache.get("matchesForDate");
    if (cachedData) {
      return res.json(cachedData);
    }

    const matchesData = await fetchMatchesForDate();
    const formattedMatches = matchesData.matches.map((match) => ({
      area: {
        id: match.area.id,
        name: match.area.name,
        code: match.area.code,
        flag: match.area.flag,
      },
      competition: {
        id: match.competition.id,
        name: match.competition.name,
        code: match.competition.code,
        type: match.competition.type,
        emblem: match.competition.emblem,
      },
      season: {
        id: match.season.id,
        startDate: match.season.startDate,
        endDate: match.season.endDate,
        currentMatchday: match.season.currentMatchday,
        winner: match.season.winner,
      },
      id: match.id,
      utcDate: match.utcDate,
      stage: match.stage,
      homeTeam: {
        name: match.homeTeam.name,
        crest: match.homeTeam.crest,
      },
      awayTeam: {
        name: match.awayTeam.name,
        crest: match.awayTeam.crest,
      },
      score: {
        winner: match.score.winner,
        fullTime: match.score.fullTime,
        halfTime: match.score.halfTime,
      },
    }));
    cache.set("matchesForDate", formattedMatches, CACHE_TTL);
    res.json(formattedMatches);
  } catch (error) {
    console.error("Error fetching matches for date:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  getScorersForCompetition,
  getMatchesForCompetition,
  getMatchesForDate,
  getStandingsForCups,
};
