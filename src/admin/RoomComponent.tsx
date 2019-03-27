import React from 'react';

import { Dialog, Theme, Table, TableHead, TableRow, TableCell, TableBody, Button, Fab, withStyles, DialogTitle, List } from '@material-ui/core';
import { Room, RoomService } from '../services/RoomService';
import AddIcon from '@material-ui/icons/Add';
import AddRoomComponent from './AddRoomComponent';

const styles = ({ palette, spacing }: Theme) => ({
    fab: {
        // margin: spacing.unit * 3
    }
});

interface State {
    rooms: Room[],
    addRoomDialogOpen: boolean
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
            addRoomDialogOpen: false
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
            console.log("Error")
        })
    }

    handleAddRoomDialogClose(refresh: boolean = false) {
        this.setState({
            ...this.state,
            addRoomDialogOpen: false
        });

        if(refresh) {
            this.populateRooms()
        }
    }

    openAddRoomDialog() {
        this.setState({
            addRoomDialogOpen: true
        });
    }

    render() {

        const { classes } = this.props;
        const { addRoomDialogOpen, rooms } = this.state;

        return (
            <div>
                <AddRoomComponent open={addRoomDialogOpen} handleClose={this.handleAddRoomDialogClose.bind(this)} />
                <Table>
                    <TableHead>
                        <TableRow>
                            {/* <TableCell>ID</TableCell> */}
                            <TableCell>Room</TableCell>
                            <TableCell>Created Date</TableCell>
                            <TableCell>Edit Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>
                                <Button color="secondary" onClick={this.openAddRoomDialog.bind(this)}>Add room</Button>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rooms.map((room: Room) => {
                            return (
                                <TableRow>
                                    {/* <TableCell align="right">{room._id}</TableCell> */}
                                    <TableCell align="right">{room.name}</TableCell>
                                    <TableCell align="right">{room.createdAt}</TableCell>
                                    <TableCell align="right">{room.updatedAt}</TableCell>
                                    <TableCell align="right">{room.status}</TableCell>
                                    <TableCell align="right"></TableCell>
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