import * as React from 'react';
import { Avatar, Card, Paper, TextField, Typography, withStyles, Grid, CardContent, List, ListItem, CardActions, Theme, Button, Fab, Dialog, DialogTitle, ListItemAvatar, ListItemText, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, ListItemIcon, FormHelperText } from '@material-ui/core';
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
import { Variant } from '../helpers/AppSnackBar';
import { MessageErrors, ChatValidator } from '../validators/ChatValidator';

const styles = ({ spacing, palette }: Theme) => ({
    root: {
        flexGrow: 1,
        margin: spacing.unit * 3
    },
    block: {
        display: "block",

    }, 
    messageContainer: {
        width: "100%", 
        maxHeight: 300,
        minHeight: 250
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
        margin: spacing.unit * 3,
        marginLeft: spacing.unit
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
    lastPage: boolean,
    errors: MessageErrors
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
        sendBtn: string,
        messageContainer: string
    },
    showSnackbar: (message: string, variant: Variant) => void
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
            lastPage: false,
            errors: {
                message: []
            }
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
            lastPage: false,
            errors: {
                message: []
            }
        });

        this.props.showSnackbar("You have left the room.", Variant.Success);
    }

    leaveRoom() {
        if(this.state.connected) {
            this.chatService.leaveRoom(this.state.roomName, this.state.chatUsername)
            .then(this.onLeaveRoom.bind(this))
            .then(() => this.props.showSnackbar("You have left the room.", Variant.Success));
        } else {
            this.props.showSnackbar("You aren't connected to a room.", Variant.Error);
        }
    }

    sendMessage() {
        const messageErrors = ChatValidator.validateMessage(this.state.message);

        if(messageErrors.length == 0) {
            this.chatService.sendMessage(this.state.message);

            this.setState({
                message: "",
                errors: {
                    message: []
                }
            });
        } else {
            this.setState({
                errors: {
                    message: messageErrors
                }
            });
        }
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
        }, () => this.props.showSnackbar("You have been disconnected.", Variant.Warning));
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

                    this.props.showSnackbar("You have joined the room.", Variant.Success);
                } else {
                    this.setState({
                        connected: false,
                        roomName: ""
                    }, () => resolve(false));

                    this.props.showSnackbar("Encountered a problem connecting to the room.", Variant.Error);
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
            this.props.showSnackbar("Problem connecting with server", Variant.Error);
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
        });
    }

    render() {
        const { classes } = this.props;
        const { errors, lastPage, connectedDialogOpen, message, messages, roomDialogOpen, rooms, messageExpansionOpen, connected, roomName, chatUsername } = this.state;

        return ( 
            <div className={classes.root}>
                <JoinRoomDialogComponent validUsername={this.validChatUsername.bind(this)} rooms={rooms} joinRoom={this.handleRoomJoin.bind(this)} onClose={this.handleRoomDialogClose.bind(this)} open={roomDialogOpen} />
                <ConnectedDialogComponent roomName={roomName} open={connectedDialogOpen} handleClose={this.closeConnectedDialog.bind(this)} />

                <ExpansionPanel expanded={messageExpansionOpen}>
                    <ExpansionPanelSummary expandIcon={connected && <ExpandMoreIcon onClick={this.toggleMessageExpansion.bind(this)} />}>
                        <Grid container spacing={24} justify="space-between">
                            <Grid item>
                                <Typography className={classes.title} align="center" variant="h6" gutterBottom>{connected ? `Room: ${roomName} - connect as: ${chatUsername}` : "Not Connected"}</Typography>
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
                        <div style={{overflowY: "scroll"}} className={classes.messageContainer}>
                            <List>
                                {!lastPage && <Button onClick={this.getPreviousMessages.bind(this)} color="secondary">Load Previous Messages</Button> }
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
                            error={errors.message.length != 0}
                            helperText={errors.message.length != 0 ? errors.message[0] : ""}
                            onKeyPress={(ev) => {
                                if(ev.key == "Enter") {
                                    ev.preventDefault();
                                    this.sendMessage();
                                }
                            }}
                        />
                        <FormHelperText error={message.length > 140 || message.length == 0 && errors.message.length != 0} className={classes.textField}>{message.length}/140</FormHelperText>
                        <Button onClick={this.sendMessage.bind(this)} className={classes.sendBtn}>Send</Button>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div>
        );
    }
}

export default withStyles(styles)(ChatComponent);
