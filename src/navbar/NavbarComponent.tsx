import * as React from 'react';
import { withStyles, AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import LoginDialogComponent from './LoginDialogComponent';
import { UserService } from '../services/UserService';
import { Variant } from '../helpers/AppSnackBar';

const styles = {
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1
  }
};

interface Props {
  classes: {
    root: string,
    grow: string
  },
  showSnackbar: (message: string, variant: Variant) => void
}

interface State {
  loginDialogOpen: boolean
}

class NavbarComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loginDialogOpen: false
    }
  }

  showLoginDialog() {
    this.setState({
      loginDialogOpen: true
    });
  }

  handleLoginDialogClose() {
    this.setState({
      loginDialogOpen: false
    });
  }

  handleLogoutClick() {
    UserService.revokeToken();
    location.reload();
  }

  render() {
    const { classes } = this.props;
    const { loginDialogOpen } = this.state;

    const isAuthenticated = UserService.isAuthenticated();

    return ( 
      <div className={classes.root}>
        <AppBar
          color="inherit"
          position="static">
            <Toolbar>
              <Typography className={classes.grow} variant="h6" color="default">
                Chat App
              </Typography>
              <Button href="/" color="inherit">Home</Button>
              { !isAuthenticated && <Button onClick={this.showLoginDialog.bind(this)} color="inherit">Login</Button> }
              { isAuthenticated && <Button href="/admin" color="inherit">Admin</Button> }
              { isAuthenticated && <Button onClick={this.handleLogoutClick.bind(this)} color="inherit">Logout</Button> }
            </Toolbar>
        </AppBar>
        <LoginDialogComponent showSnackbar={this.props.showSnackbar} open={loginDialogOpen} handleClose={this.handleLoginDialogClose.bind(this)} />
      </div>
    );
  }
}

export default withStyles(styles)(NavbarComponent);
