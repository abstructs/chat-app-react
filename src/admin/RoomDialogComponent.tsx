import React from 'react';

import { MenuItem, Theme, Dialog, DialogActions, withStyles, DialogTitle, DialogContent, TextField, FormControl, InputLabel, Select, Button, Typography } from '@material-ui/core';
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
    errors: RoomFormErrors
}

interface Props {
    classes: {
        root: string,
        textField: string
    },
    open: boolean,
    handleClose: (refresh: boolean) => void,
    dialogMode: DialogMode,
    room: RoomForm
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
            }
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
            roomForm: this.props.room
        });
    }

    render() {

        const { classes, dialogMode } = this.props;
        const { name, status } = this.state.roomForm;
        const { errors } = this.state;

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
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose.bind(this)} color="primary">Cancel</Button>
                    {dialogMode == DialogMode.ADD && <Button onClick={this.handleAdd.bind(this)} color="primary">Add</Button>}
                    {dialogMode == DialogMode.EDIT && < Button onClick={this.handleEdit.bind(this)} color="primary">Edit</Button>}
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(RoomDialogComponent);