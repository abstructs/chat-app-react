import React from 'react';

import { Theme, AppBar, Tabs, Tab, withStyles } from '@material-ui/core';
import EventHistoryComponent from './EventHistoryComponent';
import ChatHistoryComponent from './ChatHistoryComponent';
import RoomComponent from './RoomComponent';
import { UserService } from '../services/UserService';
import { Redirect } from 'react-router';
import { Variant } from '../helpers/AppSnackBar';

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
    tab: number,
    authorized: boolean,
    loading: boolean
}

interface Props {
    classes: {
        root: string
    },
    showSnackbar: (message: string, variant: Variant) => void
}

class AdminComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            tab: 0,
            authorized: false,
            loading: true
        }

        this.authorize();
    }

    handleChange(_: any, tab: number) {
        this.setState({ tab });
    }

    authorize() {
        UserService.validToken()
        .then(authorized => {
            if(authorized) {
                this.setState({
                    authorized: true,
                    loading: false
                });
            } else {
                UserService.revokeToken();
            }
        })
        .catch(_ => {
            UserService.revokeToken();
        });
    }
    
    render() {
        const { classes } = this.props;
        const { tab, authorized, loading } = this.state;

        const hasToken = UserService.hasToken();

        if(!hasToken || loading == false && !authorized) {
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
                {tab == 2 && <RoomComponent showSnackbar={this.props.showSnackbar} />}
            </div>
        );
    }
}

export default withStyles(styles)(AdminComponent);