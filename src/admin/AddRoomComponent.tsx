import React from 'react';

import { MenuItem, Theme, Dialog, DialogActions, withStyles, DialogTitle, DialogContent, TextField, FormControl, InputLabel, Select, Button } from '@material-ui/core';
import EventHistoryComponent from './EventHistoryComponent';
import ChatHistoryComponent from './ChatHistoryComponent';
import RoomComponent from './RoomComponent';
import { UserService } from '../services/UserService';
import { RoomForm, RoomStatus, RoomService } from '../services/RoomService';
import { RoomValidator, RoomFormErrors } from '../validators/RoomValidator';

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
    handleClose: (refresh: boolean) => void
}

class AddRoomComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            selectOpen: false,
            roomForm: {
                name: "",
                status: "active"
            },
            errors: {
                name: [],
                status: []
            }
        }
    }

    handleAddRoomDialogClose() {
        this.props.handleClose(false);
    }
    
    saveRoom() {
        RoomService.save(this.state.roomForm, () => {
            this.props.handleClose(true);
        }, () => {
            console.log("Error");
        });
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

    render() {

        const { classes } = this.props;
        const { name, status } = this.state.roomForm;
        const { errors } = this.state;

        return (
            <Dialog fullWidth maxWidth="xs" open={this.props.open} onClose={this.handleAddRoomDialogClose.bind(this)}>
                <DialogTitle>Add Room</DialogTitle>
                <DialogContent>
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
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select value={status} onChange={this.handleChange('status').bind(this)}>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleAddRoomDialogClose.bind(this)} color="primary">Cancel</Button>
                    <Button onClick={this.handleAdd.bind(this)} color="primary">Add</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(AddRoomComponent);