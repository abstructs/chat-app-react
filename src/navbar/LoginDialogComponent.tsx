import React from 'react';
import { DialogTitle, TextField, Dialog, Theme, withStyles, DialogContent, DialogActions, Button } from '@material-ui/core';

import { LoginForm, UserService } from '../services/UserService';
import { UserValidator, LoginFormErrors } from '../validators/UserValidator';
import { CommunicationEmail } from 'material-ui/svg-icons';

const styles = ({ spacing, palette }: Theme) => ({
    root: {
      flexGrow: 1
    },
    textField: {
        marginBottom: spacing.unit * 2
    }
});

interface Props {
    open: boolean,
    handleClose: () => void,
    classes: {
        root: string,
        textField: string
    }
}

interface State {
    loginForm: LoginForm,
    errors: LoginFormErrors
}

class LoginDialogComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            loginForm: {
                username: "",
                password: ""
            },
            errors: {
                username: [],
                password: []
            }
        }
    }

    handleClose() {
        this.props.handleClose();
    }

    handleChange(fieldName: string) {
        return (event: React.ChangeEvent<HTMLSelectElement>) => {
            this.setState({
                ...this.state,
                loginForm: {
                    ...this.state.loginForm,
                    [fieldName]: event.currentTarget.value
                }
            });
        }

    }

    formIsValid(): boolean {
        const errors: LoginFormErrors = UserValidator.validateLogin(this.state.loginForm);

        this.setState({
            ...this.state,
            errors
        });

        return errors.username.length == 0 && errors.password.length == 0;
    }

    handleLogin() {
        if(this.formIsValid()) {
            UserService.authenticate(this.state.loginForm, (res) => {
                location.reload();
            }, (err) => {
                console.log(err);
                console.log("Invalid");
            });
        } else {
            console.log("not valid")
        }
    }

    render() {
        const { open, classes } = this.props;
        const { username, password } = this.state.loginForm;

        const errors = this.state.errors;

        return (
            <Dialog className={classes.root} fullWidth maxWidth="xs" open={open} onClose={this.handleClose.bind(this)} >
                <DialogTitle>Login</DialogTitle>
                <DialogContent>
                    <TextField 
                        className={classes.textField}
                        autoFocus
                        margin="normal"
                        label="Username"
                        value={username}
                        onChange={this.handleChange('username')}
                        type="text"
                        fullWidth
                        error={errors.username.length != 0}
                        helperText={errors.username.length != 0 && errors.username[0]}
                    />
                    <TextField 
                        // className={classes.textField}
                        margin="dense"
                        label="Password"
                        value={password}
                        onChange={this.handleChange('password')}
                        type="password"
                        fullWidth
                        hidden
                        error={errors.password.length != 0}
                        helperText={errors.password.length != 0 && errors.password[0]}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose.bind(this)} color="primary">Cancel</Button>
                    <Button onClick={this.handleLogin.bind(this)} color="primary">Login</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(LoginDialogComponent);