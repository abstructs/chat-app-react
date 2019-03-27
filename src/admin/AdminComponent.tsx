import React from 'react';

import { Theme, AppBar, Tabs, Tab, withStyles } from '@material-ui/core';
import EventHistoryComponent from './EventHistoryComponent';
import ChatHistoryComponent from './ChatHistoryComponent';
import RoomComponent from './RoomComponent';
import { UserService } from '../services/UserService';
import { Redirect } from 'react-router';

const styles = ({ palette, spacing }: Theme) => ({
    root: {
        backgroundColor: palette.background.paper,
        width: 800,
        margin: "0 auto",
        marginTop: spacing.unit * 5,
        marginBottom: spacing.unit * 5
    }
});

interface State {
    tab: number
}

interface Props {
    classes: {
        root: string
    }
}

class AdminComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            tab: 0
        }
    }

    handleChange(_: any, tab: number) {
        this.setState({ tab });
    }
    
    render() {
        const { classes } = this.props;
        const { tab } = this.state;

        const isAuthenticated = UserService.isAuthenticated();

        if(!isAuthenticated) {
            return <Redirect to='/' />
        }

        return (
            <div className={classes.root}>
                <AppBar position="static" color="default">
                    <Tabs
                        value={this.state.tab}
                        onChange={this.handleChange.bind(this)}
                        variant="fullWidth"
                    >
                        <Tab label="Event History" />
                        <Tab label="Chat History" />
                        <Tab label="Rooms" />
                    </Tabs>
                </AppBar>
                {tab == 0 && <EventHistoryComponent />}
                {tab == 1 && <ChatHistoryComponent />}
                {tab == 2 && <RoomComponent />}
            </div>
        );
    }
}

export default withStyles(styles)(AdminComponent);