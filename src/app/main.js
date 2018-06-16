/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import axios from 'axios';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Redirect, Switch } from 'react-router-dom';

import Toolbar from '@material-ui/core/Toolbar';
import { withTheme } from '@material-ui/core/styles';

import { MuiThemeProvider } from '@material-ui/core/styles'; // v1.x
import { MuiThemeProvider as V0MuiThemeProvider } from 'material-ui';

import { darktheme } from './themes/dark';
import { lighttheme } from './themes/light';

import cyan from '@material-ui/core/colors/cyan';
import orange from '@material-ui/core/colors/orange';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';
import blueGrey from '@material-ui/core/colors/blueGrey';
import red from '@material-ui/core/colors/red';

// Component for router
import Login from './components/Login';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Changes from './components/Changes';
import Categories from './components/Categories';
import Settings from './components/Settings';
import Logout from './components/Logout';

import NoAccounts from './components/accounts/NoAccounts';
import AccountSelector from './components/accounts/AccountSelector';
import CurrencySelector from './components/currency/CurrencySelector';

import auth from './auth';
import AccountStore from './stores/AccountStore';
import UserStore from './stores/UserStore';

import createHistory from 'history/createBrowserHistory';
const history = createHistory();

class Main extends Component {
  constructor(props, context) {
    super(props, context);
    this.context = context;

    let now = new Date();

    this.state = {
      loading: true,
      logged: false,
      theme: darktheme,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      accounts: [],
    };
  }

  updateAccounts = () => {
    if (AccountStore.accounts && AccountStore.accounts.length === 0) {
      history.replace('/welcome');
    }
    this.setState({
      accounts: AccountStore.accounts,
    });
  };

  componentWillMount() {
    if (!localStorage.getItem('server')) {
      localStorage.setItem('server', 'https://seven23.io');
    }

    axios.defaults.baseURL = localStorage.getItem('server');

    UserStore.addChangeListener(this._userUpdate);
    AccountStore.addChangeListener(this.updateAccounts);

    this.removeListener = history.listen(location => {
      this._changeColor(location);
    });
  }

  _changeColor = route => {
    if (!route) {
      route = history.location;
    }
    if (
      route.pathname.startsWith('/dashboard') ||
      route.pathname.startsWith('/logout')
    ) {
      this.state.theme.palette.primary.main = blue[600];
    } else if (route.pathname.startsWith('/transactions')) {
      this.state.theme.palette.primary.main = cyan[700];
    } else if (route.pathname.startsWith('/changes')) {
      this.state.theme.palette.primary.main = orange[800];
    } else if (route.pathname.startsWith('/categories')) {
      this.state.theme.palette.primary.main = green[600];
    } else if (route.pathname.startsWith('/events')) {
      this.state.theme.palette.primary.main = red[600];
    } else if (route.pathname.startsWith('/settings')) {
      this.state.theme.palette.primary.main = blueGrey[500];
    } else if (route.pathname.startsWith('/login')) {
      this.state.theme.palette.primary.main = blue[600];
    } else {
      this.state.theme.palette.primary.main = blue[600];
    }
    // Edit CSS variable
    document.documentElement.style.setProperty(
      '--primary-color',
      this.state.theme.palette.primary.main,
    );
  };

  componentWillUnmount() {
    this.removeListener();
    AccountStore.removeChangeListener(this.updateAccounts);
    UserStore.removeChangeListener(this._userUpdate);
  }

  _userUpdate = () => {
    if (!this.state.logged && auth.loggedIn() && auth.isInitialize()) {
      const that = this;
      // IF user has account we go /, if not we go no-account
      // history.replace('/');
      if (that.state.accounts && that.state.accounts.length === 0) {
        history.replace('/welcome');
      } else {
        this._changeColor(history.location);
      }
    }
    this.setState({
      logged: auth.loggedIn() && auth.isInitialize(),
    });
  };

  render() {
    return (
      <MuiThemeProvider theme={this.state.theme}>
        <V0MuiThemeProvider>
          <Router history={history}>
            <main className={this.state.logged ? 'loggedin' : 'notloggedin'}>
              <MuiThemeProvider>
                <aside
                  className={
                    'navigation ' +
                    (this.state.logged ? 'loggedin' : 'notloggedin')
                  }
                  style={{
                    background: this.state.theme.palette.background.default,
                    color: this.state.theme.palette.text.default,
                  }}
                >
                  {!this.state.logged ? (
                    <Route component={Login} />
                  ) : (
                    <Route component={Navigation} />
                  )}
                </aside>
              </MuiThemeProvider>
              {this.state.logged ? (
                <div id="container">
                  {this.state.accounts && this.state.accounts.length != 0 ? (
                    <div id="toolbar">
                      <Toolbar
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <AccountSelector />
                        <CurrencySelector history={history} />
                      </Toolbar>
                    </div>
                  ) : (
                    ''
                  )}
                  <div id="content">
                    <Switch>
                      <Route path="/welcome" component={NoAccounts} />
                      <Redirect exact from="/" to="/dashboard" />
                      <Redirect exact from="/login" to="/dashboard" />
                      <Route exact path="/dashboard" component={Dashboard} />
                      <Redirect
                        exact
                        from="/transactions"
                        to={`/transactions/${this.state.year}/${
                          this.state.month
                        }`}
                      />
                      <Route
                        path="/transactions/:year/:month"
                        component={Transactions}
                      />
                      <Route exact path="/categories" component={Categories} />
                      <Route path="/categories/:id" component={Categories} />
                      <Route path="/changes" component={Changes} />
                      <Route path="/settings" component={Settings} />
                      <Route path="/logout" component={Logout} />
                    </Switch>
                  </div>
                </div>
              ) : (
                ''
              )}
            </main>
          </Router>
        </V0MuiThemeProvider>
      </MuiThemeProvider>
    );
  }
}

Main.propTypes = {
  theme: PropTypes.object.isRequired,
};

export default withTheme()(Main);
