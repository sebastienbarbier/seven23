import React, {Component} from 'react';
import { Router, Route, Redirect, Switch } from 'react-router-dom';

import Main from './main';

import Login from './components/Login';

import Logout from './components/Logout';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Changes from './components/Changes';
import Events from './components/Events';
import Event from './components/events/Event';
import Transactions from './components/Transactions';
import MonthView from './components/transactions/monthView';
import TransactionForm from './components/transactions/TransactionForm';
import Categories from './components/Categories';
import Settings from './components/Settings';

import auth from './auth';
import AccountStore from './stores/AccountStore';

import createHistory from 'history/createBrowserHistory';
const history = createHistory();

function requireAuth(nextState, replace) {
  if (!auth.loggedIn()) {
    replace({
      pathname: 'login',
      state: { nextPathname: nextState.location.pathname }
    });
  } else if (auth.isInitialize() && AccountStore.accounts && AccountStore.accounts.length === 0) {
    replace({
      pathname: 'accounts',
      state: { nextPathname: nextState.location.pathname }
    });
  }
}

class Routes extends Component {

  render() {
    return (
      <Router history={history}>
        <Switch>

          <Route name="login" path="/login" component={LoginForm} />
          <Route name="server" path="/server" component={ServerForm} />
        </Switch>
      </Router>
    );
  }
}

export default Routes;
