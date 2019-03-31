import React from 'react';

import { Snackbar, SnackbarContent, IconButton, Theme, withStyles } from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import WarningIcon from '@material-ui/icons/Warning';

import { amber, green } from '@material-ui/core/colors';

const styles = ({ spacing, palette }: Theme) => ({
    root: {
        flexGrow: 1
    },
    close: {
        width: spacing.unit * 4,
        height: spacing.unit * 4,
    },
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: palette.error.dark,
    },
    info: {
        backgroundColor: palette.primary.dark,
    },
    warning: {
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: spacing.unit
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
});

const variantIcons = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};

interface State {
    open: boolean,
    messageData: SnackbarData
}

export enum Variant {
    Success = "success",
    Error = "error",
    Info = "info",
    Warning = "warning"
}

interface Props {
    setOpenSnackbar: (openSnackbar: (message: string, variant: Variant) => void) => void,
    classes: {
        root: string,
        close: string,
        success: string,
        error: string,
        info: string,
        warning: string,
        icon: string,
        iconVariant: string,
        message: string
    }
}

interface SnackbarData {
    message: string,
    variant: Variant,
    key: number
}

class AppSnackBar extends React.Component<Props, State> {

    private queue: Array<SnackbarData>;

    constructor(props: Props) {
        super(props);

        this.state = {
            open: false,
            messageData: {
                message: "",
                variant: Variant.Info,
                key: 0
            }
        }

        this.queue = [];
        this.props.setOpenSnackbar(this.showSnackbar.bind(this));
    }

    showSnackbar(message: string, variant: Variant): void {
        this.queue.push({
            message,
            variant,
            key: new Date().getTime()
        });

        if (this.state.open) {
            this.setState({ open: false }, this.processQueue);
        }
        else {
            this.processQueue();
        }
    }

    processQueue() {
        const nextMessage = this.queue.shift();

        if (nextMessage != undefined) {
            this.setState({
                open: true,
                messageData: nextMessage
            });
        }
    }

    handleSnackbarClose(event: React.MouseEvent<HTMLElement, MouseEvent>) {
        this.setState({ open: false });
    };

    handleSnackbarExited() {
        this.processQueue();
    }

    show() {
        this.setState({ open: true });
    }

    render() {
        const { message, key, variant } = this.state.messageData;
        // const  = this.state.messageData.variant;

        const { classes } = this.props;

        const Icon = variantIcons[variant];

        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={this.state.open}
                autoHideDuration={6000}
            >
                <SnackbarContent
                    key={key}
                    className={classes[variant]}
                    message={
                        <span className={classes.message}>
                            <Icon className={classes.icon + " " + classes.iconVariant} />
                            {message}
                        </span>}
                    action={
                        <IconButton key="close" aria-label="Close" color="inherit" className={classes.icon} onClick={this.handleSnackbarClose.bind(this)}>
                            <CloseIcon />
                        </IconButton>
                    }
                // <Button key="undo" color="secondary" size="small" onClick={this.handleClose.bind(this)}>
                //   UNDO
                // </Button>,
                />
            </Snackbar>
        );
    }
}

export default withStyles(styles)(AppSnackBar);