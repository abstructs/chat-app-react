import React from 'react';

import { Dialog, Theme, Table, TableHead, TableRow, TableCell, TableBody, Button, Fab, withStyles, DialogTitle, List } from '@material-ui/core';
import { Room, RoomService, RoomForm } from '../services/RoomService';
import AddIcon from '@material-ui/icons/Add';
import RoomDialogComponent, { DialogMode } from './RoomDialogComponent';

const emptyRoom: RoomForm = {_id: null, name: "", status: "active"};

const styles = ({ palette, spacing }: Theme) => ({
    fab: {
        // margin: spacing.unit * 3
    }
});

interface State {
    rooms: Room[],
    roomDialogOpen: boolean,
    roomDialogMode: DialogMode,
    selectedRoom: RoomForm
}

interface Props {
    classes: {
        fab: string
    }
}

class RoomComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            rooms: [],
            roomDialogOpen: false,
            roomDialogMode: DialogMode.ADD,
            selectedRoom: emptyRoom
        }

        this.populateRooms();
    }

    populateRooms() {
        RoomService.findAll((rooms: Room[]) => {
            console.log(rooms);
            this.setState({
                rooms
            });
        }, () => {
            console.log("Error");
        })
    }

    handleRoomDialogClose(refresh: boolean = false) {
        this.setState({
            ...this.state,
            roomDialogOpen: false,
            selectedRoom: emptyRoom
        });

        if(refresh) {
            this.populateRooms()
        }
    }

    openRoomDialog(mode: DialogMode, room: RoomForm) {
        this.setState({
            roomDialogOpen: true,
            roomDialogMode: mode,
            selectedRoom: room
        });
    }

    render() {

        const { classes } = this.props;
        const { roomDialogOpen, rooms, roomDialogMode, selectedRoom } = this.state;

        return (
            <div>
                <RoomDialogComponent room={selectedRoom} dialogMode={roomDialogMode} open={roomDialogOpen} handleClose={this.handleRoomDialogClose.bind(this)} />
                <Table>
                    <TableHead>
                        <TableRow>
                            {/* <TableCell>ID</TableCell> */}
                            <TableCell>Room</TableCell>
                            <TableCell>Created Date</TableCell>
                            <TableCell>Edit Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>
                                <Button color="secondary" onClick={() => this.openRoomDialog(DialogMode.ADD, emptyRoom)}>Add</Button>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rooms.map((room: Room) => {
                            const createdAt = new Date(room.createdAt);
                            const updatedAt = new Date(room.updatedAt);

                            return (
                                <TableRow>
                                    {/* <TableCell align="right">{room._id}</TableCell> */}
                                    <TableCell align="right">{room.name}</TableCell>
                                    <TableCell align="right">{createdAt.toLocaleString()}</TableCell>
                                    <TableCell align="right">{updatedAt.toLocaleString()}</TableCell>
                                    <TableCell align="right">{room.status}</TableCell>
                                    <TableCell align="right"><Button onClick={() => this.openRoomDialog(DialogMode.EDIT, room)}>Edit</Button></TableCell>
                                </TableRow>
                            );
                        })}
                        {/* render rows */}

                        {/* end */}
                    </TableBody>
                </Table>
            </div>
        );
    }
}

export default withStyles(styles)(RoomComponent);