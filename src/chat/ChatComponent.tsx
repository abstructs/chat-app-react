import * as React from 'react';
import { Avatar, Card, Paper, TextField, Typography, withStyles, Grid, CardContent, List, ListItem, CardActions, Theme, Button, Fab, Dialog, DialogTitle, ListItemAvatar, ListItemText } from '@material-ui/core';
import { MuiTheme } from 'material-ui/styles';

import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';

import RoomIcon from '@material-ui/icons/Chat';
import { Room, RoomService } from '../services/RoomService';

const styles = ({ spacing, palette }: Theme) => ({
    root: {
        flexGrow: 1,
        margin: spacing.unit * 3
    },
    card: {
        minWidth: 500,
        maxWidth: 600,
        minHeight: 300,
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
    avatar: {

    }
})

interface State {
    roomDialogOpen: boolean,
    rooms: Room[]
}

interface Props {
    classes: {
        card: string,
        root: string,
        textField: string,
        formContainer: string,
        fab: string,
        title: string,
        avatar: string
    }
}

class ChatComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            roomDialogOpen: false,
            rooms: []
        }

        this.getRooms();
    }

    openRoomDialog() {
        this.setState({
            roomDialogOpen: true
        });
    } 

    handleRoomDialogClose() {
        this.setState({
            roomDialogOpen: false
        });
    }

    getRooms() {
        RoomService.findAll((rooms) => {
            console.log(rooms);
        }, () => {
            console.log("Something went wrong");
        })
    }

    render() {
        const { classes } = this.props;
        const { roomDialogOpen, rooms } = this.state;

        return ( 
            <div className={classes.root}>
                <Dialog fullWidth maxWidth="xs" open={roomDialogOpen} onClose={this.handleRoomDialogClose.bind(this)}>
                    <DialogTitle>Rooms</DialogTitle>
                    <div>
                        <List>
                            {rooms.map(room => {
                                return (
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar className={classes.avatar}>
                                                <RoomIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={room.name}></ListItemText>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </div>
                </Dialog>

                <Grid container justify="center" xs={12}>
                    <Card color="inherit" className={classes.card}>
                        <Grid container spacing={24} justify="space-between">
                            <Grid item>
                                <Typography className={classes.title} align="center" variant="h6" gutterBottom>Messages</Typography>
                            </Grid>
                            <Grid item>
                                <Fab onClick={this.openRoomDialog.bind(this)} size="small" color="primary" aria-label="Add" className={classes.fab}>
                                    <SpeakerNotesIcon />
                                </Fab>
                            </Grid>
                        </Grid>
                        <CardContent>
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
                        </CardContent>
                        <CardActions>
                            {/* <form className={classes.formContainer}> */}
                                <TextField 
                                    label="Message"
                                    value=""
                                    className={classes.textField}
                                    fullWidth
                                    multiline
                                />
                                <Button>Send</Button>
                            {/* </form> */}
                        </CardActions>
                    </Card>
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles)(ChatComponent);
