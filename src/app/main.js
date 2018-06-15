/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import axios from "axios";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Router, Route, Redirect, Switch } from "react-router-dom";
import { AnimatedSwitch } from "react-router-transition";

import Toolbar from '@material-ui/core/Toolbar';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'; // v1.x
import { MuiThemeProvider as V0MuiThemeProvider} from 'material-ui';
import getMuiTheme from "material-ui/styles/getMuiTheme";

import { v0darktheme, darktheme } from "./themes/dark";
import { v0lighttheme, lighttheme } from "./themes/light";

import cyan from '@material-ui/core/colors/cyan';
import orange from '@material-ui/core/colors/orange';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';
import blueGrey from '@material-ui/core/colors/blueGrey';
import red from '@material-ui/core/colors/red';

// Component for router
import Login from "./components/Login";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Changes from "./components/Changes";
import Categories from "./components/Categories";
import Settings from "./components/Settings";
import Logout from "./components/Logout";

import NoAccounts from "./components/accounts/NoAccounts";
import AccountSelector from "./components/accounts/AccountSelector";
import CurrencySelector from "./components/currency/CurrencySelector";

import auth from "./auth";
import storage from "./storage";
import AccountStore from "./stores/AccountStore";
import UserStore from "./stores/UserStore";

import createHistory from "history/createBrowserHistory";
const history = createHistory();

const styles = {
  title: {
    textAlign: "left"
  },
  iconButton: {
    width: 55,
    height: 55
  },
  icon: {
    width: 25,
    height: 25
  },
  hamburger: {
    color: "white",
    width: 30,
    height: 30,
    padding: "14px 16px"
  },
  drawer: {
    paddingTop: 20
  }
};

class Main extends Component {
  constructor(props, context) {
    super(props, context);
    this.context = context;

    let now = new Date();

    this.state = {
      loading: true,
      logged: false,
      background: blue[600],
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      accounts: []
    };
  }

  updateAccounts = () => {
    if (AccountStore.accounts && AccountStore.accounts.length === 0) {
      history.replace("/welcome");
    }
    this.setState({
      accounts: AccountStore.accounts
    });
  };

  componentWillMount() {
    if (!localStorage.getItem("server")) {
      localStorage.setItem("server", "https://seven23.io");
    }

    axios.defaults.baseURL = localStorage.getItem("server");

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
      route.pathname.startsWith("/dashboard") ||
      route.pathname.startsWith("/logout")
    ) {
      v0lighttheme.palette.primary1Color = blue[600];
      lighttheme.palette.primary.main = blue[600];
    } else if (route.pathname.startsWith("/transactions")) {
      v0lighttheme.palette.primary1Color = cyan[700];
      lighttheme.palette.primary.main = cyan[700];
    } else if (route.pathname.startsWith("/changes")) {
      v0lighttheme.palette.primary1Color = orange[800];
      lighttheme.palette.primary.main = orange[800];
    } else if (route.pathname.startsWith("/categories")) {
      v0lighttheme.palette.primary1Color = green[600];
      lighttheme.palette.primary.main = green[600];
    } else if (route.pathname.startsWith("/events")) {
      v0lighttheme.palette.primary1Color = red[600];
      lighttheme.palette.primary.main = red[600];
    } else if (route.pathname.startsWith("/settings")) {
      v0lighttheme.palette.primary1Color = blueGrey[500];
      lighttheme.palette.primary.main = blueGrey[500];
    } else if (route.pathname.startsWith("/login")) {
      v0lighttheme.palette.primary1Color = blue[600];
      lighttheme.palette.primary.main = blue[600];
    } else {
      v0lighttheme.palette.primary1Color = blue[600];
      lighttheme.palette.primary.main = blue[600];
    }
    // Edit CSS variable
    document.documentElement.style.setProperty(
      `--primary-color`,
      lighttheme.palette.primary.main
    );
    // setState trigger dom rendering
    this.setState({
      background: lighttheme.palette.primary.main
    });
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
        history.replace("/welcome");
      } else {
        this._changeColor(history.location);
      }
    }
    this.setState({
      logged: auth.loggedIn() && auth.isInitialize()
    });
  };

  render() {
    return (
      <MuiThemeProvider theme={lighttheme}>
        <V0MuiThemeProvider muiTheme={getMuiTheme(v0lighttheme)}>
          <Router history={history}>
            <main className={this.state.logged ? "loggedin" : "notloggedin"}>
              <div id="iPadBorder"> </div>
              <MuiThemeProvider theme={darktheme}>
                <V0MuiThemeProvider muiTheme={getMuiTheme(v0darktheme)}>
                  <aside
                    className={
                      "navigation " +
                      (this.state.logged ? "loggedin" : "notloggedin")
                    }
                    style={{ background: this.state.background }}
                  >
                    {!this.state.logged ? (
                      <Route component={Login} />
                    ) : (
                      <Route component={Navigation} />
                    )}
                  </aside>
                </V0MuiThemeProvider>
              </MuiThemeProvider>
              {this.state.logged ? (
                <div id="container">
                  {this.state.accounts && this.state.accounts.length != 0 ? (
                    <div id="toolbar">
                      <Toolbar style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <AccountSelector />
                        <CurrencySelector history={history} />
                      </Toolbar>
                    </div>
                  ) : (
                    ""
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
                ""
              )}
            </main>
          </Router>
        </V0MuiThemeProvider>
      </MuiThemeProvider>
    );
  }
}

export default Main;
