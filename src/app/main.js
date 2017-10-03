/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import axios from 'axios';
import React, {Component} from 'react';
import { Router, Route, Redirect, Switch } from 'react-router-dom';

import Routes from './routes';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CircularProgress from 'material-ui/CircularProgress';

// Component for router
import Login from './components/Login';
import Layout from './components/Layout';

import auth from './auth';
import storage from './storage';
import AccountStore from './stores/AccountStore';
import UserStore from './stores/UserStore';

import createHistory from 'history/createBrowserHistory';
const history = createHistory();

const styles = {
  container: {
    height: '100%',
    position: 'relative',
  },
  title: {
    textAlign: 'left',
  },
};

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#2b3d51',
    accent1Color: '#2b3d51',
  },
});

class Main extends Component {

  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.state = {
      loading: true,
      logged: false,
    };
  }

  componentWillMount() {

    if (!localStorage.getItem('server')) {
      localStorage.setItem('server', 'https://seven23.io');
    }

    axios.defaults.baseURL = localStorage.getItem('server');

    UserStore.addChangeListener(this._userUpdate);

    var component = this;
    // connect storage to indexedDB
    storage.connectIndexedDB().then(() => {
      if (auth.loggedIn() && !auth.isInitialize()) {
        auth.initialize().then(() => {
          // If after init user has no account, we redirect ot create one.
          if (AccountStore.accounts && AccountStore.accounts.length === 0) {
            this.context.router.push('/accounts');
          }
          component.setState({
            loading: false,
            logged: true
          });
        });
      } else {
        component.setState({
          loading: false,
          logged: false
        });
      }
    }).catch((exception) => {
      console.error(exception);
    });
  }

  componentWillUnmount() {
    UserStore.removeChangeListener(this._userUpdate);
  }

  _userUpdate = () => {
    if (!this.state.logged && auth.loggedIn() && auth.isInitialize()) {
      setTimeout(() => {
        history.replace('/');
      }, 350);
    }
    this.setState({
      logged: auth.loggedIn() && auth.isInitialize()
    });
  };

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        {this.state.loading ?
          <div className="flexboxContainer">
            <div className="flexbox">
              <CircularProgress size={80} />
            </div>
          </div>
          :
          <div style={styles.container}>
            <Router history={history}>
            { !this.state.logged
            ?
              <Route component={Login} />
            :
              <Route component={Layout} />
            }
            </Router>
          </div>
        }
      </MuiThemeProvider>
    );
  }
}

export default Main;
