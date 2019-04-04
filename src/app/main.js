/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Router, Route, Redirect, Switch, Link } from 'react-router-dom';

import axios from 'axios';

import encryption from './encryption';

import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';

import { createMuiTheme } from '@material-ui/core/styles';
import { MuiThemeProvider } from '@material-ui/core/styles'; // v1.x

import { darktheme } from './themes/dark';
import { lighttheme } from './themes/light'; // eslint-disable-line no-unused-vars

import SyncButton from './components/accounts/SyncButton';
import AccountSelector from './components/accounts/AccountSelector';
import CurrencySelector from './components/currency/CurrencySelector';
import UserButton from './components/settings/UserButton';

// Component for router
import Login from './components/Login';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Transactions from './components/Transactions';
import Changes from './components/Changes';
import Categories from './components/Categories';
import Settings from './components/Settings';
import Logout from './components/Logout';
import NewAccounts from './components/NewAccounts';

import AppActions from './actions/AppActions';

import createHistory from 'history/createBrowserHistory';
const history = createHistory();

import './main.scss';

class Main extends Component {
  constructor(props, context) {
    super(props, context);
    this.context = context;

    if (props.user.cipher) {
      encryption.key(props.user.cipher);
    }
    if (props.server.url) {
      axios.defaults.baseURL = props.server.url;
    }

    this.state = {
      theme: createMuiTheme(props.user.theme === 'dark' ? darktheme : lighttheme),
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    };
  }

  componentWillMount() {
    const { dispatch, app } = this.props;

    if (app && app.url && history.location.pathname !== '/logout') {
      history.push(app.url);
    }

    this._changeColor(this.props.user.theme, location);
    this.removeListener = history.listen(location => {
      dispatch(AppActions.navigate(location.pathname));
      this._changeColor(this.props.user.theme, location);
    });
  }

  _changeColor = (_theme, route = history.location) => {

    let theme = (_theme === 'dark' ? darktheme : lighttheme);

    if (this.props.user.accounts.length === 0) {
      theme.palette.primary = theme.palette.dashboard.primary;
      theme.palette.primary.main = theme.palette.dashboard.main;
    } else if (route.pathname.startsWith('/dashboard')) {
      theme.palette.primary = theme.palette.dashboard.primary;
      theme.palette.primary.main = theme.palette.dashboard.main;
    } else if (route.pathname.startsWith('/transactions')) {
      theme.palette.primary = theme.palette.transactions.primary;
      theme.palette.primary.main = theme.palette.transactions.main;
    } else if (route.pathname.startsWith('/categories')) {
      theme.palette.primary = theme.palette.categories.primary;
      theme.palette.primary.main = theme.palette.categories.main;
    } else if (route.pathname.startsWith('/changes')) {
      theme.palette.primary = theme.palette.changes.primary;
      theme.palette.primary.main = theme.palette.changes.main;
    } else if (route.pathname.startsWith('/analytics')) {
      theme.palette.primary = theme.palette.report.primary;
      theme.palette.primary.main = theme.palette.report.main;
    } else if (route.pathname.startsWith('/settings')) {
      theme.palette.primary = theme.palette.settings.primary;
      theme.palette.primary.main = theme.palette.settings.main;
    } else {
      theme.palette.primary = theme.palette.default.primary;
      theme.palette.primary.main = theme.palette.default.main;
    }


    theme = createMuiTheme(theme);

    const css = document.documentElement.style;
    // Edit CSS variable
    css.setProperty('--primary-color', theme.palette.primary.main);
    css.setProperty('--loading-color', theme.palette.divider);
    css.setProperty('--background-color', theme.palette.background.default);
    css.setProperty('--divider-color', theme.palette.divider);
    css.setProperty('--text-color', theme.palette.text.primary);
    css.setProperty('--paper-color', theme.palette.background.paper);
    css.setProperty('--cardheader-color', theme.palette.cardheader);

    this.setState({ theme });
  };

  componentWillUnmount() {
    this.removeListener();
  }

  componentWillReceiveProps(newProps) {
    // Server from isSyncing to Synced
    if (!this.props.server.isLogged && newProps.server.isLogged) {
      if (newProps.user.accounts && newProps.user.accounts.length === 0) {
        history.push('/');
      } else {
        this._changeColor(newProps.user.theme, history.location);
      }
    }
    // Event on theme change
    if (this.props.user.theme != newProps.user.theme) {
      this._changeColor(newProps.user.theme);
    }

    // This cas handle a logout
    if (this.props.user.token && !newProps.user.token) {
      history.push('/login');
    }
  }

  render() {
    const { theme } = this.state;

    const { server, isSyncing, isConnecting, accounts } = this.props;

    return (
      <Router history={history}>
        <MuiThemeProvider theme={createMuiTheme(theme)}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <div id="appContainer">
              <div id="iPadBorder"></div>

              { !server.isLogged ? (
                <Route component={Login} />
              ) : '' }

              { server.isLogged && !isConnecting ? (
                <div id="container" style={{
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary
                }}>


                  { accounts.length >= 1 ? (
                    <aside className="navigation">
                      <Route component={Navigation} />
                    </aside>
                  ) : '' }
                  <div id="content">

                    { server.isLogged && !isConnecting ? (
                      <div id="toolbar" className="hideMobile">
                        <div className="left">
                        </div>
                        <div className="right">
                          <SyncButton className="showDesktop" />

                          { accounts && accounts.length >= 1 ? <hr className="showDesktop" /> : '' }
                          { accounts && accounts.length > 1 ? <AccountSelector disabled={isSyncing} className="showDesktop" /> : '' }
                          { accounts && accounts.length >= 1 ? <CurrencySelector history={history} disabled={isSyncing} display="code" className="showDesktop" /> : '' }
                          <hr className="showDesktop" />
                          <UserButton history={history} />
                        </div>
                      </div>
                    ) : ''}
                    <main>
                    {
                      accounts.length >= 1 ? (
                        <Switch>

                          <Redirect exact from="/" to="/dashboard" />
                          <Redirect exact from="/login" to="/dashboard" />
                          <Redirect exact from="/resetpassword" to="/dashboard" />
                          <Route exact path="/dashboard" component={Dashboard} />
                          <Route exact path="/analytics" component={Analytics} />
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
                          <Route exact path="/changes" component={Changes} />
                          <Route path="/changes/:id" component={Changes} />
                          <Route path="/settings" component={Settings} />
                          <Route path="/logout" component={Logout} />
                        </Switch>
                      ) : (
                        <Switch>
                          <Route path="/logout" component={Logout} />
                          <Route component={NewAccounts} />
                        </Switch>
                      )}
                      </main>
                  </div>
                </div>
              ) : ''}
            </div>
          </MuiPickersUtilsProvider>
        </MuiThemeProvider>
      </Router>
    );
  }
}

Main.propTypes = {
  dispatch: PropTypes.func.isRequired,
  app: PropTypes.object,
  user: PropTypes.object,
  isSyncing: PropTypes.bool.isRequired,
  isConnecting: PropTypes.bool.isRequired,
  accounts: PropTypes.array.isRequired,
  server: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    app: state.app,
    user: state.user,
    isSyncing: state.state.isSyncing,
    isConnecting: state.state.isConnecting,
    accounts: state.user.accounts,
    server: state.server
  };
};

export default connect(mapStateToProps)(Main);