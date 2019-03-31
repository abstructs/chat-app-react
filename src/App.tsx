import React from 'react';
import NavbarComponent from './navbar/NavbarComponent';
import logo from './logo.svg';
import './App.css';
import ChatComponent from './chat/ChatComponent';
import AdminComponent from './admin/AdminComponent';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import AppSnackBar, { Variant } from './helpers/AppSnackBar';

interface Props {

}

interface State {

}

const blueTheme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      light: '#bef67a',
      main: '#8bc34a',
      dark: '#5a9216',
      contrastText: '#ffffff'
    },
    secondary: {
      light: '#b6ffff',
      main: '#81d4fa',
      dark: '#4ba3c7',
      contrastText: '#000000',
    },
  },
});

class App extends React.Component<Props, State> {

  private openSnackbar: (message: string, variant: Variant) => void;

  constructor(props: Props) {
    super(props);

    this.openSnackbar = (m, v) => {};
  }

  setOpenSnackbar(openSnackbar: (message: string, variant: Variant) => void) {
    this.openSnackbar = openSnackbar;
  }

  render() {

    return (
      <Router>
        <MuiThemeProvider theme={blueTheme}>
          <AppSnackBar setOpenSnackbar={this.setOpenSnackbar.bind(this)} />
          <NavbarComponent showSnackbar={(m, v) => this.openSnackbar(m, v)} />
          <Route exact path="/" render={(routeProps) => (<ChatComponent {...routeProps} showSnackbar={(m, v) => this.openSnackbar(m, v)} />)} />
          <Route exact path="/admin" render={(routeProps) => (<AdminComponent {...routeProps} showSnackbar={(m, v) => this.openSnackbar(m, v)} />)} />
        </MuiThemeProvider>
      </Router>
    );
  }
}

export default App;
