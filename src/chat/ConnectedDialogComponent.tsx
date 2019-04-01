import React from 'react';

import { Theme, Dialog, DialogActions, withStyles, DialogTitle, DialogContent, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@material-ui/core';
import { RoomService } from '../services/RoomService';

import PersonIcon from '@material-ui/icons/Person';

export enum DialogMode {
    ADD, EDIT
}

const styles = ({ palette, spacing }: Theme) => ({
    root: {
        backgroundColor: palette.background.paper,
        width: 800,
        margin: "0 auto",
        marginTop: spacing.unit * 5,
        marginBottom: spacing.unit * 5
    },
    textField: {

    }
});

interface State {
    users: String[],
}

interface Props {
    classes: {
        root: string,
        textField: string
    },
    open: boolean,
    handleClose: () => void,
    roomName: string
}

class ConnectedDialogComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            users: []
        }
    }

    handleClose() {
        this.props.handleClose();
    }

    getConnectedUsers() {
        RoomService.viewConnected(this.props.roomName)
        .then(usernames => {
            this.setState({
                users: usernames
            });
        });
    }

    handleEnter() {
        this.getConnectedUsers();
    }

    render() {
        const { users } = this.state;

        return (
            <Dialog onEnter={this.handleEnter.bind(this)} fullWidth maxWidth="xs" open={this.props.open} onClose={this.handleClose.bind(this)}>
                <DialogTitle>Connected Users</DialogTitle>
                <DialogContent>
                    <List>
                        {users.map((username, index) => {
                            return (
                                <ListItem key={index}>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <PersonIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={username}></ListItemText>
                                </ListItem>
                            );
                        })}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose.bind(this)} color="secondary">Close</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(ConnectedDialogComponent);