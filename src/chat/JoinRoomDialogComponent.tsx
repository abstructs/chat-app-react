import React from 'react';

import { TextField, StepLabel, ListItem, Avatar, Dialog, Theme, Button, withStyles, DialogTitle, List, ListItemAvatar, ListItemText, Stepper, Step, Grid } from '@material-ui/core';
import { Room, RoomForm } from '../services/RoomService';
import AddIcon from '@material-ui/icons/Add';
import RoomIcon from '@material-ui/icons/Chat';
import { DarkRawTheme } from 'material-ui/styles';
import { ChatService } from '../services/ChatService';
import { ChatValidator } from '../validators/ChatValidator';


const emptyRoom: RoomForm = {_id: null, name: "", status: "active"};

const styles = ({ palette, spacing }: Theme) => ({
    avatar: {
        // margin: spacing.unit * 3
    },
    stepperActions: {
        margin: "auto",
        marginBottom: spacing.unit
    },
    textField: {
        
    },
    form: {
        margin: spacing.unit * 3,
        marginTop: spacing.unit * 2,
        marginBottom: spacing.unit * 2
    },
    selected: {
        backgroundColor: palette.secondary.dark
    },
    connectBtn: {
        margin: "auto"
    },
    connectContainer: {
        display: "block",
        margin: "auto"
    }
});

interface JoinRoomForm {
    roomName: string,
    username: string
}

interface JoinRoomFormErrors {
    roomName: string[],
    username: string[]
}

interface State {
    // rooms: Room[],
    // open: boolean,
    // roomDialogMode: DialogMode,
    step: number,
    joinRoomForm: JoinRoomForm
    errors: JoinRoomFormErrors
}

interface Props {
    classes: {
        avatar: string,
        stepperActions: string,
        textField: string,
        form: string,
        selected: string,
        connectBtn: string,
        connectContainer: string
    },
    open: boolean,
    onClose: () => void,
    rooms: Room[],
    joinRoom: (roomName: string, username: string) => Promise<Boolean>,
    validUsername: (roomName: string, username: string) => Promise<Boolean>
}

const defaultState = {
    step: 0,
    joinRoomForm: {
        roomName: "",
        username: "",
    },
    errors: {
        roomName: [],
        username: [],
    }
};

class JoinRoomDialogComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = defaultState;
    }

    handleClose() {
        this.props.onClose();
    }

    setRoomName(roomName: string) {
        this.setState({
            joinRoomForm: {
                ...this.state.joinRoomForm,
                roomName
            }
        });
    }   

    handleUsernameNext() {
        const { roomName, username } = this.state.joinRoomForm;

        const syncUsernameErrors = ChatValidator.validateUsername(username);

        if(syncUsernameErrors.length != 0) {
            this.setState({
                errors: {
                    ...this.state.errors,
                    username: syncUsernameErrors
                }
            });

            return;
        } 

        this.props.validUsername(roomName, username)
        .then(validUsername => {
            if(validUsername) {
                this.setState({
                    step: 2
                });
            } else {
                this.setState({
                    errors: {
                        ...this.state.errors,
                        username: ["Username taken"].concat(this.state.errors.username)
                    }
                });
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    handleConnectNext() {
        const { roomName, username } = this.state.joinRoomForm;

        this.props.joinRoom(roomName, username)
        .then(connected => {
            if(connected) {
                this.setState(defaultState);
            }
        });
    }

    handleNext() {
        if(this.state.step == 1) {
            this.handleUsernameNext();
        } else if(this.state.step == 2) {
            this.handleConnectNext();
        } else {
            this.setState({
                step: Math.min(this.state.step + 1, 2)
            });
        }
    }

    handleBack() {
        this.setState({
            step: Math.max(this.state.step - 1, 0)
        });
    }

    handleUsernameChange(event: React.ChangeEvent<HTMLSelectElement>) {
        this.setState({
            joinRoomForm: {
                ...this.state.joinRoomForm,
                username: event.target.value
            }
        });
    }

    handleReset() {
        this.setState({
            step: 0
        });
    }

    render() {

        const { open, rooms, classes } = this.props; 
        const { step, errors } = this.state;
        const { roomName, username } = this.state.joinRoomForm;

        return (
            <Dialog fullWidth maxWidth="sm" open={open} onClose={this.handleClose.bind(this)}>
                <Stepper activeStep={step}>
                    <Step>
                        <StepLabel>Choose A Room</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Choose A Username</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Connect</StepLabel>
                    </Step>
                </Stepper>
                {step == 0 &&
                    <List>
                        {rooms.map(room => {
                            return (
                                <ListItem className={room.name == roomName ? classes.selected : ""} key={room._id}>
                                    <ListItemAvatar>
                                        <Avatar className={classes.avatar}>
                                            <RoomIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={room.name}></ListItemText>
                                    <Button onClick={() => this.setRoomName(room.name)}>Join</Button>
                                </ListItem>
                            );
                        })}
                    </List>
                }
                {step == 1 && 
                    <div className={classes.form}> 
                        <TextField
                            className={classes.textField}
                            autoFocus
                            margin="normal"
                            label="Username"
                            value={username}
                            onChange={this.handleUsernameChange.bind(this)}
                            type="text"
                            fullWidth
                            error={errors.username.length != 0}
                            helperText={errors.username.length != 0 && errors.username[0]}
                        />
                    </div>
                }

                {step == 2 && 
                    <div className={classes.form}> 
                        <TextField
                            className={classes.textField}
                            autoFocus
                            margin="normal"
                            label="Room Name"
                            value={roomName}
                            type="text"
                            fullWidth
                            disabled
                        />
                        <TextField
                            className={classes.textField}
                            autoFocus
                            margin="normal"
                            label="Username"
                            value={username}
                            type="text"
                            fullWidth
                            disabled
                        />
                    </div>
                }

                <div className={classes.stepperActions}>
                    <Button onClick={this.handleBack.bind(this)} disabled={step == 0}>Prev</Button>
                    <Button onClick={this.handleNext.bind(this)} disabled={step == 0 && roomName == "" || step == 1 && username == ""} color="primary">{step != 2 ? "Next" : "Connect"}</Button>
                </div>
            </Dialog>
        );
    }
}

export default withStyles(styles)(JoinRoomDialogComponent);