/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Router, Route, Redirect, Switch } from 'react-router-dom';

import Toolbar from '@material-ui/core/Toolbar';

import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';

import { createMuiTheme } from '@material-ui/core/styles';
import { MuiThemeProvider } from '@material-ui/core/styles'; // v1.x

import { darktheme } from './themes/dark';
import { lighttheme } from './themes/light'; // eslint-disable-line no-unused-vars

import cyan from '@material-ui/core/colors/cyan';
import orange from '@material-ui/core/colors/orange';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';
import blueGrey from '@material-ui/core/colors/blueGrey';

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

import createHistory from 'history/createBrowserHistory';
const history = createHistory();

class Main extends Component {
  constructor(props, context) {
    super(props, context);
    this.context = context;

    let now = new Date();

    const { user } = this.props.state;
    const theme = createMuiTheme(user.theme === 'dark' ? darktheme : lighttheme);

    this.state = {
      theme,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };

    document.documentElement.style.setProperty(
      '--primary-color', theme.palette.background.default,
    );
  }

  componentWillMount() {
    this.removeListener = history.listen(location => {
      this._changeColor(this.props.state.user.theme, location);
    });
  }

  _changeColor = (_theme, route = history.location) => {

    let theme = (_theme === 'dark' ? darktheme : lighttheme);
    if (route.pathname.startsWith('/dashboard')) {
      theme.palette.primary = blue;
      theme.palette.primary.main = blue[600];
      // this.state.theme.palette.primary.main = blue[600];
    } else if (route.pathname.startsWith('/transactions')) {
      theme.palette.primary = cyan;
      theme.palette.primary.main = cyan[700];
      // this.state.theme.palette.primary.main = cyan[700];
    } else if (route.pathname.startsWith('/changes')) {
      theme.palette.primary = orange;
      theme.palette.primary.main = orange[800];
      // this.state.theme.palette.primary.main = orange[800];
    } else if (route.pathname.startsWith('/categories')) {
      theme.palette.primary = green;
      theme.palette.primary.main = green[600];
      // this.state.theme.palette.primary.main = green[600];
    } else if (route.pathname.startsWith('/settings')) {
      theme.palette.primary = blueGrey;
      theme.palette.primary.main = blueGrey[500];
      // this.state.theme.palette.primary.main = blueGrey[500];
    } else {
      theme.palette.primary = blue;
      theme.palette.primary.main = blue[600];
      // Replace main by background to have an empty login page
      theme.palette.primary.main = this.state.theme.palette.background.default;
    }

    theme = createMuiTheme(theme);

    const css = document.documentElement.style;
    // Edit CSS variable
    css.setProperty('--primary-color', theme.palette.primary.main);
    css.setProperty('--loading-color', theme.palette.divider);
    css.setProperty('--background-color', theme.palette.background.default);
    css.setProperty('--divider-color', theme.palette.divider);

    this.setState({ theme });
  };

  componentWillUnmount() {
    this.removeListener();
  }

  componentWillReceiveProps(newProps) {
    // Server from isSyncing to Synced
    if (newProps.state.user.token && newProps.state.user.profile && !newProps.state.server.isSyncing) {
      if (newProps.state.accounts && newProps.state.accounts.length === 0) {
        history.replace('/welcome');
      } else {
        this._changeColor(this.props.state.user.theme, history.location);
      }
    }
    // Event on theme change
    if (this.props.state.user.theme != newProps.state.user.theme) {
      this._changeColor(newProps.state.user.theme);
    }
  }

  _userUpdate = () => {
    const { user } = this.props.state;
    if (user.token && !user.profile) {
      const that = this;
      // IF user has account we go /, if not we go no-account
      // history.replace('/');
      if (that.state.accounts && that.state.accounts.length === 0) {
        history.replace('/welcome');
      } else {
        this._changeColor(this.props.state.user.theme, history.location);
      }
    }
  };

  render() {
    const { theme } = this.state;

    const { state } = this.props;
    const { accounts, profile } = state.user;

    return (
      <MuiThemeProvider theme={createMuiTheme(theme)}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Router history={history}>
            <main className={profile ? 'loggedin' : 'notloggedin'}>
              <div id="iPadBorder"></div>
              <aside
                className={
                  'navigation ' +
                  (profile ? 'loggedin' : 'notloggedin')
                }
                style={{
                  color: theme.palette.text.primary,
                  borderRightColor: theme.palette.divider
                }}
              >
                {!profile ? (
                  <Route component={Login} />
                ) : (
                  <Route component={Navigation} />
                )}
              </aside>
              {profile ? (
                <div id="container" style={{
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary
                }}>
                  {accounts && accounts.length != 0 ? (
                    <div id="toolbar" style={{
                      borderBottomColor: theme.palette.divider,
                      backgroundColor: theme.palette.background.default }}>
                      <Toolbar
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-end'
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
        </MuiPickersUtilsProvider>
      </MuiThemeProvider>
    );
  }
}

Main.propTypes = {
  dispatch: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return { state };
};

export default connect(mapStateToProps)(Main);
