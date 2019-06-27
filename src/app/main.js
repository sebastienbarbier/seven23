/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Router, Route, Redirect, Switch } from 'react-router-dom';

import axios from 'axios';
import encryption from './encryption';

import { MuiThemeProvider } from '@material-ui/core/styles'; // v1.x
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';


import SyncButton from './components/accounts/SyncButton';
import AccountSelector from './components/accounts/AccountSelector';
import CurrencySelector from './components/currency/CurrencySelector';
import UserButton from './components/settings/UserButton';
import SnackbarsManager from './components/snackbars/SnackbarsManager';

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
import ServerActions from './actions/ServerActions';

import { useTheme } from './theme';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();
let removeListener = null ;

import './main.scss';

export const Main = () => {

  const dispatch = useDispatch();

  // Update app path
  if (removeListener) {
    removeListener();
  }
  removeListener = history.listen(location => {
    dispatch(AppActions.navigate(location.pathname));
  });

  // Init axios
  axios.defaults.timeout = 10000;
  axios.interceptors.response.use((response) => response, (error) => {
    if (error && error.response && error.response.status === 503) {
      dispatch(ServerActions.maintenance());
    } else {
      dispatch(ServerActions.error(error.response));
    }
    return Promise.reject(error);
  });

  // Update encryption cipher
  const cipher = useSelector(state => state.user ? state.user.cipher : '');
  useEffect(() => {
    if (cipher) {
      encryption.key(cipher);
    }
  }, [cipher]);

  // Update server url
  const url = useSelector(state => state.server ? state.server.url : '');
  useEffect(() => {
    axios.defaults.baseURL = url;
  }, [url]);

  // TODO : Think about this code. Was suppose to reopen the app whenever zou close it.
  // Not necessary since iOS now keep state in memory
  //
  // const appUrl = useSelector(state => state.app ? state.app.url : null);
  // if (appUrl && history.location.pathname !== '/logout'&& history.location.pathname !== '/resetpassword') {
  //   console.log('Main should redirect to : ', appUrl);
  //   // withRouter(({ history }) => history.push(appUrl) );
  // }

  // manage Theme
  const theme = useTheme();
  const accounts = useSelector(state => state.user ? state.user.accounts : null);
  const isConnecting = useSelector(state => state.state.isConnecting);
  const isSyncing = useSelector(state => state.state.isSyncing || state.state.isLoading);
  const isLogged = useSelector(state => state.server ? state.server.isLogged : false);

  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  return (
    <Router history={history}>
      <MuiThemeProvider theme={theme}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <div id="appContainer">
            <div id="iPadBorder"></div>

            { !isLogged ? (
              <Route component={Login} />
            ) : '' }

            { isLogged && !isConnecting ? (
              <div id="container" style={{
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary
              }}>

                { accounts && accounts.length >= 1 ? (
                  <aside className="navigation">
                    <Route component={Navigation} />
                  </aside>
                ) : '' }
                <div id="content">

                  { isLogged && !isConnecting ? (
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
                  <main style={{ position: 'relative', flexGrow: 1 }}>
                    {
                      accounts && accounts.length >= 1 ? (
                        <Switch>

                          <Redirect exact from="/" to="/dashboard" />
                          <Redirect exact from="/login" to="/dashboard" />
                          <Redirect exact from="/resetpassword" to="/dashboard" />
                          <Route exact path="/dashboard" component={Dashboard} />
                          <Route exact path="/analytics" component={Analytics} />
                          <Redirect
                            exact
                            from="/transactions"
                            to={`/transactions/${year}/${month}`}
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
                    <SnackbarsManager />
                  </main>
                </div>

              </div>
            ) : ''}
          </div>
        </MuiPickersUtilsProvider>
      </MuiThemeProvider>
    </Router>
  );
};