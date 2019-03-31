import React from 'react';

import { Dialog, Theme, Table, TableHead, TableRow, TableCell, TableBody, Button, Fab, withStyles, DialogTitle, List, TablePagination } from '@material-ui/core';
import { Room, RoomService, RoomForm } from '../services/RoomService';
import AddIcon from '@material-ui/icons/Add';
import RoomDialogComponent, { DialogMode } from './RoomDialogComponent';

const emptyRoom: RoomForm = {_id: null, name: "", status: "active"};

const styles = ({ palette, spacing }: Theme) => ({
});

interface State {
    rooms: Room[],
    roomDialogOpen: boolean,
    roomDialogMode: DialogMode,
    selectedRoom: RoomForm,
    page: number,
    rowsPerPage: number,
    roomsCount: number,
}

interface Props {
}

const rowsPerPageOptions = [5, 10, 15];

class RoomComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            rooms: [],
            roomDialogOpen: false,
            roomDialogMode: DialogMode.ADD,
            selectedRoom: emptyRoom,
            page: 0,
            rowsPerPage: 5,
            roomsCount: 0,
        }

        this.getRooms();
    }

    getRooms() {
        RoomService.getRooms(this.state.page, this.state.rowsPerPage)
            .then((res: { rooms: Room[], roomsCount: number }) => {
                this.setState({
                    rooms: res.rooms,
                    roomsCount: res.roomsCount
                });
            })
            .catch(err => {
                console.log("Error");
            });
    }

    handleRoomDialogClose(refresh: boolean = false) {
        this.setState({
            ...this.state,
            roomDialogOpen: false,
            selectedRoom: emptyRoom
        });

        if(refresh) {
            this.getRooms()
        }
    }

    openRoomDialog(mode: DialogMode, room: RoomForm) {
        this.setState({
            roomDialogOpen: true,
            roomDialogMode: mode,
            selectedRoom: room
        });
    }

    handleChangePage(event: React.MouseEvent<HTMLButtonElement> | null, page: number) {
        this.setState({
            page
        }, this.getRooms);        
    }

    handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
        const rowsPerPage = parseInt(event.target.value);

        this.setState({
            rowsPerPage,
            page: 0
        }, this.getRooms);
    }

    render() {
        const { roomDialogOpen, rooms, roomDialogMode, selectedRoom, page, rowsPerPage, roomsCount } = this.state;

        return (
            <div>
                <RoomDialogComponent room={selectedRoom} dialogMode={roomDialogMode} open={roomDialogOpen} handleClose={this.handleRoomDialogClose.bind(this)} />
                <Table>
                    <TableHead>
                        <TableRow>
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
                                    <TableCell align="right">{room.name}</TableCell>
                                    <TableCell align="right">{createdAt.toLocaleString()}</TableCell>
                                    <TableCell align="right">{updatedAt.toLocaleString()}</TableCell>
                                    <TableCell align="right">{room.status}</TableCell>
                                    <TableCell align="right"><Button onClick={() => this.openRoomDialog(DialogMode.EDIT, room)}>Edit</Button></TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                <TablePagination
                        rowsPerPage={rowsPerPage}
                        rowsPerPageOptions={rowsPerPageOptions}
                        component="div"
                        count={roomsCount}
                        page={page}
                        SelectProps={{
                            native: true
                        }}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page'
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page'
                        }}
                        onChangePage={this.handleChangePage.bind(this)}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage.bind(this)}
                    />
            </div>
        );
    }
}

export default withStyles(styles)(RoomComponent);