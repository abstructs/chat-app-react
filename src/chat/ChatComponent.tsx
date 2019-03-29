import * as React from 'react';
import { Avatar, Card, Paper, TextField, Typography, withStyles, Grid, CardContent, List, ListItem, CardActions, Theme, Button, Fab, Dialog, DialogTitle, ListItemAvatar, ListItemText, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, ListItemIcon } from '@material-ui/core';
import { MuiTheme } from 'material-ui/styles';

import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';

import RoomIcon from '@material-ui/icons/Chat';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { Room, RoomService } from '../services/RoomService';

import io from 'socket.io-client';
import { ChatService } from '../services/ChatService';
import JoinRoomDialogComponent from './JoinRoomDialogComponent';

const styles = ({ spacing, palette }: Theme) => ({
    root: {
        flexGrow: 1,
        margin: spacing.unit * 3
    },
    block: {
        display: "block"
    },
    card: {
        minWidth: 500,
        maxWidth: 600,
        // minHeight: 300,
        padding: spacing.unit * 3
    },
    textField: {
        marginLeft: spacing.unit,
        marginRight: spacing.unit
    },
    formContainer: {
        // display: 'flex',
        // flexWrap: 'wrap'
    },
    fab: {
        margin: spacing.unit * 3
    },
    title: {
        margin: spacing.unit * 3
    },
    sendBtn: {
        margin: "auto",
        display: "block",
        marginTop: spacing.unit * 3,
        marginBottom: spacing.unit
    },
    avatar: {

    }
});

interface Message {
    user: string,
    message: string
}

interface State {
    roomDialogOpen: boolean,
    rooms: Room[],
    messageExpansionOpen: boolean,
    connected: boolean,
    roomName: string,
    messages: Message[],
    chatUsername: string
}

interface Props {
    classes: {
        card: string,
        root: string,
        textField: string,
        formContainer: string,
        fab: string,
        title: string,
        avatar: string,
        block: string,
        sendBtn: string
    }
}

class ChatComponent extends React.Component<Props, State> {

    private chatService: ChatService;

    constructor(props: Props) {
        super(props);
        
        this.chatService = new ChatService();

        this.state = {
            roomDialogOpen: false,
            rooms: [],
            messageExpansionOpen: false,
            chatUsername: "",
            roomName: "",
            messages: [],
            connected: false
        }
        
        this.getRooms();
    }

    toggleMessageExpansion() {
        this.setState({
            messageExpansionOpen: !this.state.messageExpansionOpen
        });
    }

    openRoomDialog() {
        this.getRooms();

        this.setState({
            roomDialogOpen: true
        });
    } 

    handleRoomDialogClose() {
        this.setState({
            roomDialogOpen: false
        });
    }

    joinRoom(roomName: string, username: string) {
        this.chatService.connectToRoom(roomName, username)
        .then(connected => {
            if(connected) {
                this.setState({
                    connected: true,
                    roomName,
                    chatUsername: username,
                    roomDialogOpen: false,
                    messageExpansionOpen: true
                });
            } else {
                this.setState({
                    connected: false,
                    roomName: "",
                    roomDialogOpen: false,
                    messageExpansionOpen: false
                });
            }
        });
    }

    validChatUsername(roomName: string, username: string): Promise<Boolean> {
        return this.chatService.validChatUsername(roomName, username);
    }

    getRooms() {
        RoomService.findAll((rooms) => {
            this.setState({
                rooms
            });
        }, () => {
            console.log("Something went wrong");
        });
    }

    render() {
        const { classes } = this.props;
        const { roomDialogOpen, rooms, messageExpansionOpen, connected, roomName, chatUsername } = this.state;

        return ( 
            <div className={classes.root}>
                <JoinRoomDialogComponent validUsername={this.validChatUsername.bind(this)} rooms={rooms} joinRoom={this.joinRoom.bind(this)} onClose={this.handleRoomDialogClose.bind(this)} open={roomDialogOpen} />

                <ExpansionPanel expanded={messageExpansionOpen}>
                    <ExpansionPanelSummary expandIcon={connected && <ExpandMoreIcon onClick={this.toggleMessageExpansion.bind(this)} />}>
                        <Grid container spacing={24} justify="space-between">
                            <Grid item direction="column">
                                <Typography className={classes.title} align="center" variant="h6" gutterBottom>{connected ? `${roomName} - Connected as ${chatUsername}` : "Not Connected"}</Typography>
                            </Grid>
                            <Grid item direction="column">
                                <Fab onClick={this.openRoomDialog.bind(this)} size="small" color="primary" className={classes.fab}>
                                    <SpeakerNotesIcon />
                                </Fab>
                            </Grid>
                        </Grid>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.block}>
                        <div style={{width: "100%"}}>
                            <List>
                                <ListItem>
                                    Andrew: Hi
                                </ListItem>
                                <ListItem>
                                    Andrew: Hi
                                </ListItem>
                                <ListItem>
                                    Andrew: Hi
                                </ListItem>
                            </List>
                        </div>
                        <TextField 
                            label="Message"
                            value=""
                            className={classes.textField}
                            fullWidth
                            multiline
                        />
                        <Button className={classes.sendBtn}>Send</Button>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div>
        );
    }
}

export default withStyles(styles)(ChatComponent);
