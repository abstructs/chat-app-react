import * as React from 'react';
import { Avatar, Card, Paper, TextField, Typography, withStyles, Grid, CardContent, List, ListItem, CardActions, Theme, Button, Fab, Dialog, DialogTitle, ListItemAvatar, ListItemText, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, ListItemIcon } from '@material-ui/core';
import { MuiTheme } from 'material-ui/styles';

import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';
import GroupIcon from '@material-ui/icons/Group';

import RoomIcon from '@material-ui/icons/Chat';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LeaveIcon from '@material-ui/icons/ExitToApp';

import { Room, RoomService } from '../services/RoomService';

import { ChatService, ChatMessage, MessageType } from '../services/ChatService';
import JoinRoomDialogComponent from './JoinRoomDialogComponent';
import { CommunicationStayCurrentLandscape } from 'material-ui/svg-icons';
import ConnectedDialogComponent from './ConnectedDialogComponent';

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
        margin: spacing.unit * 2
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

interface State {
    roomDialogOpen: boolean,
    rooms: Room[],
    messageExpansionOpen: boolean,
    connected: boolean,
    roomName: string,
    messages: ChatMessage[],
    chatUsername: string,
    message: string,
    connectedDialogOpen: boolean,
    page: number,
    lastPage: boolean
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
    private connectionTime: Date;

    constructor(props: Props) {
        super(props);
        
        this.chatService = new ChatService(this.onNewMessage.bind(this), this.onClientDisconnect.bind(this));
        this.connectionTime = new Date();

        this.state = {
            roomDialogOpen: false,
            rooms: [],
            messageExpansionOpen: false,
            chatUsername: "",
            roomName: "",
            messages: [],
            connected: false,
            message: "",
            connectedDialogOpen: false,
            page: 0,
            lastPage: false
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

    onLeaveRoom() {
        this.setState({
            chatUsername: "",
            roomName: "",
            messages: [],
            connected: false,
            messageExpansionOpen: false,
            page: 0,
            lastPage: false
        });
    }

    leaveRoom() {
        if(this.state.connected) {
            this.chatService.leaveRoom(this.state.roomName, this.state.chatUsername)
            .then(this.onLeaveRoom.bind(this));
        }
    }

    sendMessage() {
        this.chatService.sendMessage(this.state.message);

        this.setState({
            message: ""
        });
    }

    onNewMessage(message: ChatMessage) {
        this.setState({
            messages: this.state.messages.concat([message])
        });
    }

    onClientDisconnect() {
        this.setState({
            chatUsername: "",
            roomName: "",
            messages: [],
            connected: false,
            messageExpansionOpen: false
        });
    }

    handleMessageChange(event: React.ChangeEvent<HTMLSelectElement>) {
        this.setState({
            message: event.target.value
        });
    }

    joinRoom(roomName: string, username: string): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            this.connectionTime = new Date();
            
            this.chatService.connectToRoom(roomName, username)
            .then(connected => {
                if(connected) {

                    this.setState({
                        connected: true,
                        roomName,
                        chatUsername: username,
                        roomDialogOpen: false,
                        messageExpansionOpen: true
                    }, () => resolve(true));
                } else {
                    this.setState({
                        connected: false,
                        roomName: ""
                    }, () => resolve(false));
                }
            });
        });
    }

    validChatUsername(roomName: string, username: string): Promise<Boolean> {
        return this.chatService.validChatUsername(roomName, username);
    }

    handleRoomJoin(roomName: string, username: string): Promise<Boolean> {
        return this.joinRoom(roomName, username);
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

    openConnectedDialog() {
        this.setState({
            connectedDialogOpen: true
        });
    }

    closeConnectedDialog() {
        this.setState({
            connectedDialogOpen: false
        });
    }

    getPreviousMessages() {
        RoomService.getMessages(this.state.roomName, this.state.page, this.connectionTime)
        .then(messages => {
            this.setState({
                messages: messages.concat(this.state.messages),
                page: this.state.page + 1,
                lastPage: messages.length == 0
            });
            console.log(messages);
        });
    }

    render() {
        const { classes } = this.props;
        const { lastPage, connectedDialogOpen, message, messages, roomDialogOpen, rooms, messageExpansionOpen, connected, roomName, chatUsername } = this.state;

        return ( 
            <div className={classes.root}>
                <JoinRoomDialogComponent validUsername={this.validChatUsername.bind(this)} rooms={rooms} joinRoom={this.handleRoomJoin.bind(this)} onClose={this.handleRoomDialogClose.bind(this)} open={roomDialogOpen} />
                <ConnectedDialogComponent roomName={roomName} open={connectedDialogOpen} handleClose={this.closeConnectedDialog.bind(this)} />

                <ExpansionPanel expanded={messageExpansionOpen}>
                    <ExpansionPanelSummary expandIcon={connected && <ExpandMoreIcon onClick={this.toggleMessageExpansion.bind(this)} />}>
                        <Grid container spacing={24} justify="space-between">
                            <Grid item>
                                <Typography className={classes.title} align="center" variant="h6" gutterBottom>{connected ? `${roomName} - Connected as ${chatUsername}` : "Not Connected"}</Typography>
                            </Grid>
                            <Grid item>
                                {!connected && 
                                    <Fab onClick={this.openRoomDialog.bind(this)} size="small" color="primary" className={classes.fab}>
                                        <SpeakerNotesIcon />
                                    </Fab>
                                }
                                {connected && 
                                    <div>
                                        <Fab onClick={this.openConnectedDialog.bind(this)} size="small" color="primary" className={classes.fab}>
                                            <GroupIcon />
                                        </Fab>
                                        <Fab onClick={this.leaveRoom.bind(this)} size="small" color="secondary" className={classes.fab}>
                                            <LeaveIcon />
                                        </Fab>
                                    </div>
                                }
                            </Grid>
                        </Grid>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.block}>
                        <div style={{width: "100%"}}>
                            <List>
                                {!lastPage && <Button onClick={this.getPreviousMessages.bind(this)}color="primary">Load Previous Messages</Button> }
                                {messages.map((message, index) => {
                                    return (
                                        <ListItem key={index}>
                                            {message.type.toString() === "message" && <Typography>{message.username}: {message.message}</Typography> }
                                            {(message.type.toString() === "join" || message.type.toString() == "disconnect") && <Typography align="center">{message.message}</Typography> }
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </div>
                        <TextField 
                            label="Message"
                            value={message}
                            onChange={this.handleMessageChange.bind(this)}
                            className={classes.textField}
                            fullWidth
                            multiline
                        />
                        <Button onClick={this.sendMessage.bind(this)} className={classes.sendBtn}>Send</Button>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div>
        );
    }
}

export default withStyles(styles)(ChatComponent);
