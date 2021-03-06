class PowerRankingsOrchestrator {
    constructor() {
        this.data = {};
        this.statsData = {};
        this.weekByWeekData = {};
        this.teamsList = [];
        this.algorithm = {
            recordRank: 0.6,
            pointsFor: 0.4
        };
    }

    static orchestrate() {
        // this.data = data;
        // this.initializeStatsTable();
        // this.initializeWeekByWeekTable();
    }

    initializeStatsTable() {
        const teamData = this.data.stats;
        Object.keys(teamData).forEach((key, i) => {
            const team = teamData[key];
            const teamIdentifier = this.getTeamIdentifier(team.OWNER, team.TEAM);
            this.teamsList.push(teamIdentifier);

            const awayWins = team.AWAY.split('-')[0];
            const awayLosses = team.AWAY.split('-')[1];
            const homeWins = team.HOME.split('-')[0];
            const homeLosses = team.HOME.split('-')[1];
            const totalWins = Number(awayWins) + Number(homeWins);
            const totalLosses = Number(awayLosses) + Number(homeLosses);

            this.statsData[teamIdentifier] = {
                record: `${totalWins}-${totalLosses}`,
                winningPercentage: totalWins / (totalWins + totalLosses),
                recordRank: i + 1,
                pointsFor: team.PF,
                pointsAgainst: team.PA
            };
        });
    }

    initializeWeekByWeekTable() {
        const scoreboardData = this.data.scoreboard;
        this.teamsList.forEach((team) => {
            this.weekByWeekData[team] = [];
        });

        scoreboardData.forEach((week) => {
            week.scoreboard.forEach((matchup) => {
                matchup.forEach((team) => {
                    const teamIdentifer = this.getTeamIdentifier(team.owner, team.team);
                    const teamArray = this.weekByWeekData[teamIdentifer];
                    teamArray[week.week] = team.points;
                });
            });
        });
    }

    static getTeamIdentifier(owner, teamName) {
        return `${owner} | ${teamName}`;
    }
}

module.exports = PowerRankingsOrchestrator;
