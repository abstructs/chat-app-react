import React from 'react';

import { MenuItem, Theme, Dialog, DialogActions, withStyles, DialogTitle, DialogContent, TextField, FormControl, InputLabel, Select, Button, Typography, Radio, FormControlLabel, FormHelperText, Checkbox } from '@material-ui/core';
import EventHistoryComponent from './EventHistoryComponent';
import ChatHistoryComponent from './ChatHistoryComponent';
import RoomComponent from './RoomComponent';
import { UserService } from '../services/UserService';
import { RoomForm, RoomStatus, RoomService } from '../services/RoomService';
import { RoomValidator, RoomFormErrors } from '../validators/RoomValidator';

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
    selectOpen: boolean,
    roomForm: RoomForm,
    errors: RoomFormErrors,
    deleteRoom: boolean
}

interface Props {
    classes: {
        root: string,
        textField: string
    },
    open: boolean,
    handleClose: (refresh: boolean) => void,
    dialogMode: DialogMode,
    room: RoomForm,
    deleteRoomEnabled: boolean
}

class RoomDialogComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            selectOpen: false,
            roomForm: this.props.room,
            errors: {
                name: [],
                status: []
            },
            deleteRoom: false
        }
    }

    handleClose() {
        this.props.handleClose(false);
    }
    
    saveRoom() {
        if(this.props.dialogMode == DialogMode.ADD) {
            RoomService.save(this.state.roomForm, () => {
                this.props.handleClose(true);
            }, () => {
                console.log("Error");
            });
        }

        if(this.props.dialogMode == DialogMode.EDIT) {
            RoomService.edit(this.state.roomForm, () => {
                this.props.handleClose(true);
            }, () => {
                console.log("Error");
            });
        }

    }

    handleAdd() {
        RoomValidator.validateRoom(this.state.roomForm)
        .then(errors => {
            this.setState({
                errors
            });

            if(errors.name.length == 0 && errors.status.length == 0) {
                this.saveRoom();
            }
        });
    }

    handleEdit() {
        const statusErrors = RoomValidator.validateStatus(this.state.roomForm.status);

        this.setState({
            errors: {
                ...this.state.errors,
                status: statusErrors
            }
        });

        if(statusErrors.length == 0) {
            this.saveRoom();
        }
    }

    handleChange(fieldName: string) {
        return (event: React.ChangeEvent<HTMLSelectElement>) => {
            this.setState({
                roomForm: {
                    ...this.state.roomForm,
                    [fieldName]: event.target.value
                }
            });
        }
    }

    handleEnter() {
        this.setState({
            roomForm: this.props.room,
            deleteRoom: false
        });
    }

    handleDeleteRadioChange() {
        this.setState({
            deleteRoom: !this.state.deleteRoom
        });
    }

    handleDelete() {
        if(typeof this.state.roomForm._id == "string") {
            const roomId: string = this.state.roomForm._id;

            RoomService.deleteRoom(roomId)
                .then(deleted => {
                    if(deleted) {
                        this.props.handleClose(true);
                    } else {
                        console.log("error")
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }

    render() {

        const { classes, dialogMode, deleteRoomEnabled } = this.props;
        const { name, status } = this.state.roomForm;
        const { errors, deleteRoom } = this.state;

        return (
            <Dialog onEnter={this.handleEnter.bind(this)} fullWidth maxWidth="xs" open={this.props.open} onClose={this.handleClose.bind(this)}>
                {dialogMode == DialogMode.ADD && <DialogTitle>Add Room</DialogTitle> }
                {dialogMode == DialogMode.EDIT && <DialogTitle>Edit Room</DialogTitle> }
                <DialogContent>
                    {dialogMode == DialogMode.ADD &&
                        <TextField
                            className={classes.textField}
                            autoFocus
                            margin="normal"
                            label="Name"
                            value={name}
                            onChange={this.handleChange('name')}
                            type="text"
                            fullWidth
                            error={errors.name.length != 0}
                            helperText={errors.name.length != 0 && errors.name[0]}
                        />
                    }
                    {dialogMode == DialogMode.EDIT &&
                        <TextField
                            className={classes.textField}
                            autoFocus
                            margin="normal"
                            label="name"
                            value={name}
                            onChange={this.handleChange('name')}
                            type="text"
                            fullWidth
                            error={errors.name.length != 0}
                            helperText={errors.name.length != 0 && errors.name[0]}
                            disabled
                        />
                    }
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select value={status} onChange={this.handleChange('status').bind(this)}>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                    {dialogMode == DialogMode.EDIT &&
                        <div>
                            <FormControlLabel 
                                label="Delete Room" 
                                control={
                                    <Checkbox 
                                        checked={deleteRoom} 
                                        disabled={!deleteRoomEnabled}
                                        onChange={this.handleDeleteRadioChange.bind(this)}
                                    />
                                }
                            />
                            { !deleteRoomEnabled && <FormHelperText>Must set the room to inactive first</FormHelperText> }
                        </div>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose.bind(this)} color="primary">Cancel</Button>
                    {dialogMode == DialogMode.ADD && <Button onClick={this.handleAdd.bind(this)} color="primary">Add</Button>}
                    {!deleteRoom && dialogMode == DialogMode.EDIT && <Button onClick={this.handleEdit.bind(this)} color="primary">Edit</Button>}
                    {deleteRoom && dialogMode == DialogMode.EDIT && <Button onClick={this.handleDelete.bind(this)} color="primary">Delete</Button>}
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(RoomDialogComponent);