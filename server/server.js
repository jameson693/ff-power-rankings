const bodyParser = require('body-parser');
const powerRankingsServer = require('./powerRankingsServer');
const express = require('express');
const espnAccessor = require('./espnAccessor');
const path = require('path');
const { API, LEAGUE } = require('./constants');
const request = require('request');
const dataAccessor = require('./dataAccessor');
const analyze = require('./analyze');
const DataTable = require('./DataTable');
const csv = require('node-csv').createParser();
const Bundler = require('parcel-bundler');
const paths = require('../config/paths');

const app = express();
const http = require('http').Server(app);

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.all('*', (req, res, next) => {
    if (req.originalUrl !== '/json' && req.originalUrl !== '/json/version') {
        console.log(`${req.method} ${req.originalUrl}`); // eslint-disable-line no-console
    }
    next();
});

app.post('/powerRankings', powerRankingsServer.postPowerRankings);

app.get('/espnData', async (req, res) => {
    let status = 200;
    // const data = await espnAccessor.getEspnData();
    const data = await espnAccessor.getDataFromApi();
    if (data) {
        res.status(status).send(data);
    } else {
        status = 500;
        res.status(status).send({});
    }
});

app.get('/runAnalysis', async (req, res) => {
    dataAccessor.getDataFromFile('leagueData').then((data) => {
        if (data) {
            analyze.generatePowerRankings(data).then((analysis) => {
                res.status(200).send(analysis);
            }, (err) => {
                res.status(500).send(err);
            });
        } else {
            res.status(500).send({});
        }
    });
});

app.get('/tables', async (req, res) => {
    dataAccessor.getDataFromFile('leagueData').then((data) => {
        if (data) {
            const pointsPerGameTable = new DataTable('PointsPerGame');
            pointsPerGameTable.initializeFromDataSet(data.scoreboard);
            pointsPerGameTable.writeTableToFile();

            const gameOutComeTable = new DataTable('GameOutcomes');
            gameOutComeTable.initializeFromDataSet(data.scoreboard);
            gameOutComeTable.writeTableToFile();

            res.status(200).send({
                ppg: pointsPerGameTable.getTable(),
                outcomes: gameOutComeTable.getTable()
            });
        } else {
            res.status(500).send({});
        }
    });
});

app.get('/dataFromFile', async (req, res) => {
    let status = 200;
    dataAccessor.getDataFromFile('leagueData').then((data) => {
        if (data) {
            res.status(status).send(data);
        } else {
            status = 500;
            res.status(status).send({});
        }
    });
});

app.get('/rosterStrength', async (req, res) => {
    csv.parseFile('config/data/2017/roster-strength-2017.csv', (err, data) => {
        if (err) {
            res.status(400).send(err);
        } else {
            res.status(200).send(data.filter(row => row[0] !== 'Owner'));
        }
    });
});

app.get('/leagueSettings', async (req, res) => {
    const { season } = req.query;
    if (season) {
        espnAccessor.getLeagueSettings(season).then((data) => {
            if (data) {
                res.status(200).send(data);
            } else {
                res.status(500).send({});
            }
        });
    } else {
        res.status(400).send({
            error: {
                message: 'Must provide a season'
            }
        });
    }
});

app.get('/roster', (req, res) => {
    const { team, week } = req.query;
    if (team && week) {
        const url = `${API.ESPN.HOST}/rosterInfo?leagueId=${LEAGUE.ID}&seasonId=2017&teamIds=${team}&scoringPeriodId=${week}`;
        console.log(url);
        request(url, (err, response, body) => {
            if (err) {
                res.status(500).send(err);
            } else {
                const data = JSON.parse(body);
                if (response.statusCode >= 400) {
                    res.status(response.statusCode).send({
                        error: {
                            message: 'error requesing data'
                        }
                    });
                } else {
                    const { teams } = data.leagueRosters;
                    if (teams.length === 1) {
                        const { slots } = teams[0];
                        const roster = slots.map(slot => slot.player);
                        res.status(200).send(roster);
                    } else {
                        res.status(404).send({
                            error: {
                                message: 'Couldnt find roster'
                            }
                        });
                    }
                }
            }
        });
    } else {
        res.status(400).send({
            error: {
                message: 'Missing team or week'
            }
        });
    }
});

const parcelOptions = {
    watch: true
};
const bundler = new Bundler(paths.indexHtml, parcelOptions);
app.use(bundler.middleware());

app.use('*', express.static(path.resolve('dist/index.html')));

http.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
