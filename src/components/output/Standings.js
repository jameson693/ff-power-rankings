import React from 'react';
import {
    Avatar,
    Card,
    CardContent,
    CardHeader,
    CardMedia,
    Dialog,
    ExpansionPanel,
    ExpansionPanelSummary,
    Hidden,
    LinearProgress,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PropTypes from 'prop-types';

const styles = {
    table: {
        overflowX: 'auto'
    },
    teamImage: {
        height: 0,
        paddingTop: '100%'
    },
    progress: {
        'padding-top': '2em',
        'padding-bottom': '2em'
    },
    panelSummary: {
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center',
        'padding-left': '10px'
    }
};

class Standings extends React.Component {
    state = {
        standings: [],
        loading: true,
        dialogOpen: false
    };

    onClick = (team) => {
        console.log(team);
        this.setState({
            dialogOpen: true,
            dialogTeam: team
        });
    };

    onDialogClose = () => {
        this.setState({
            dialogOpen: false
        });
    };

    componentDidMount() {
        fetch('/espnData').then(result => result.json()).then(({ standings }) => {
            const sortedStandings = standings.sort((a, b) => a.overallStanding - b.overallStanding);
            this.setState({
                standings: sortedStandings,
                loading: false
            });
        }).catch((err) => {
            console.error(err);
        });
    }

    buildStandingsPanels() {
        const content = this.state.standings.map((team, index) => (
            <ExpansionPanel key={index + 1} defaultExpanded={!index}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Avatar>{index + 1}</Avatar><Typography className={this.props.classes.panelSummary}> {team.team} </Typography>
                </ExpansionPanelSummary>
            </ExpansionPanel>
        ));

        return <div> {content} </div>;
    }

    buildTable() {
        return (
            <Paper className={this.props.classes.table}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Rank</TableCell>
                            <TableCell>Team</TableCell>
                            <Hidden xsDown>
                                <TableCell>Owner</TableCell>
                            </Hidden>
                            <TableCell>Wins</TableCell>
                            <TableCell>Losses</TableCell>
                            <Hidden xsDown>
                                <TableCell>Points Scored</TableCell>
                                <TableCell>Points Allowed</TableCell>
                            </Hidden>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.standings.map((team, index) => (
                            <TableRow key={index + 1} onClick={() => this.onClick(team)} hover>
                                <TableCell>{index + 1 }</TableCell>
                                <TableCell>{`${team.teamLocation} ${team.teamNickname}`}</TableCell>
                                <Hidden xsDown>
                                    <TableCell>{`${team.owners[0].firstName} ${team.owners[0].lastName}`}</TableCell>
                                </Hidden>
                                <TableCell>{team.record.overallWins}</TableCell>
                                <TableCell>{team.record.overallLosses}</TableCell>
                                <Hidden xsDown>
                                    <TableCell>{team.record.pointsFor}</TableCell>
                                    <TableCell>{team.record.pointsAgainst}</TableCell>
                                </Hidden>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        );
    }

    getLoadingContent = () => (
        <div className={this.props.classes.progress}>
            <LinearProgress />
            <br />
            <LinearProgress color="secondary" />
        </div>
    );

    getDialogContent = () => {
        const { classes } = this.props;
        const currentTeam = this.state.dialogTeam;
        let dialogContent = <div />;
        let owner;

        if (currentTeam) {
            owner = `${currentTeam.owners[0].firstName} ${currentTeam.owners[0].lastName}`;
            dialogContent = (
                <Dialog
                    open={this.state.dialogOpen}
                    onClose={this.onDialogClose}
                >
                    <Card>
                        <CardHeader
                            avatar={
                                <Avatar>{currentTeam.overallStanding}</Avatar>
                            }
                            title={`${currentTeam.teamLocation} ${currentTeam.teamNickname}`}
                            subheader={owner}
                        />
                        <CardMedia
                            className={classes.teamImage}
                            image={currentTeam.logoUrl}
                        />
                        <CardContent>
                            This is the content
                        </CardContent>
                    </Card>
                </Dialog>
            );
        }

        return dialogContent;
    };

    render() {
        return (
            <div>
                {this.state.loading ? this.getLoadingContent() : this.buildTable()}
                {this.getDialogContent()}
            </div>
        );
    }
}

Standings.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Standings);
