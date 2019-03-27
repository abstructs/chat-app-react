import React from 'react';
import NavbarComponent from './navbar/NavbarComponent';
import logo from './logo.svg';
import './App.css';
import ChatComponent from './chat/ChatComponent';
import AdminComponent from './admin/AdminComponent';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';

import { BrowserRouter as Router, Route } from 'react-router-dom';

interface Props {

}

interface State {

}

const blueTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      light: '#ff5131',
      main: '#d50000',
      dark: '#9b0000',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#fd558f',
      main: '#c51162',
      dark: '#8e0038',
      contrastText: '#ffffff'
    },
  },
});


class App extends React.Component<Props, State> {
  render() {
    return (
      <Router>
        <MuiThemeProvider theme={blueTheme}>
        <NavbarComponent />
        <Route exact path="/" component={ChatComponent}/>
        <Route exact path="/admin" component={AdminComponent}/>
        </MuiThemeProvider>
      </Router>
    );
  }
}

export default App;
