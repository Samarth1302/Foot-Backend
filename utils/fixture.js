/*matches, scorers, competitions

{{url}}/v4/competitions- stored in db
[BSA,PL,ELC,FL1,BL1,SA,DED,PPL,PD] (league codes) [CL,EC,CLI] (cup codes)
{{url}}/v4/competitions/__/matches --- daily fetch (12)
{{url}}/v4/competitions/__/scorers  --- daily fetch (12)
{{url}}/v4/competitions/[CL,EC,CLI]/standings --- direct dynamic fetch (3)
{{url}}/v4/matches/ (ONLY DAY TO DAY BASIS) --- direct dynamic fetch (1)

*/
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const cron = require('node-cron');
const Competition = require('../models/Competition');

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function fetchMatchesAndScorers(competitionCode) {
    const matchesUrl = `{{url}}/v4/competitions/${competitionCode}/matches`;
    const scorersUrl = `{{url}}/v4/competitions/${competitionCode}/scorers`;
    
    const matchesData = await fetchData(matchesUrl);
    const scorersData = await fetchData(scorersUrl);
    
    return { matches: matchesData, scorers: scorersData };
}

async function fetchStandings(competitionCode) {
    const standingsUrl = `{{url}}/v4/competitions/${competitionCode}/standings`;
    return await fetchData(standingsUrl);
}

async function fetchMatchesForDate(date) {
    const matchesUrl = `{{url}}/v4/matches/?date=${date}`;
    return await fetchData(matchesUrl);
}

async function fetchAndStoreCompetitions() {
    const competitionsData = await fetchData('{{url}}/v4/competitions');
    await Competition.insertMany(competitionsData);
}
/*
cron.schedule('0 0 * * *', async () => {
    const competitions = await Competition.find();
    competitions.forEach(async (competition) => {
        const { matches, scorers } = await fetchMatchesAndScorers(competition.compCode);
        competition.data.matches = matches;
        competition.data.scorers = scorers;
        await competition.save();
    });
});*/