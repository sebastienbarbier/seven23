import React, {Component} from 'react';
import { Router, Route, browserHistory, Redirect } from 'react-router';

import Main from './main';

import Login from './components/Login';
import LoginForm from './components/login/LoginForm';
import ServerForm from './components/login/ServerForm';
import ForgottenPasswordForm from './components/login/ForgottenPasswordForm';
import CreateAccountForm from './components/login/CreateAccountForm';
import NoAccounts from './components/accounts/NoAccounts';
import About from './components/login/About';
import Logout from './components/Logout';
import Layout from './components/Layout';
import Changes from './components/Changes';
import Transactions from './components/Transactions';
import TransactionForm from './components/transactions/TransactionForm';
import Categories from './components/Categories';
import Category from './components/categories/Category';
import Settings from './components/Settings';

import auth from './auth';
import AccountStore from './stores/AccountStore';

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

  // <Route name="dashboard" path="dashboard" component={Dashboard} onEnter={requireAuth} />
  render() {
    return (
      <Router history={browserHistory}>
        <Redirect from="/" to="/transactions" />
        <Route component={Main}>
          <Route component={Login}>
            <Route name="login" path="login" component={LoginForm} />
            <Route name="server" path="server" component={ServerForm} />
            <Route name="forgotpassword" path="forgotpassword" component={ForgottenPasswordForm} />
            <Route name="createaccount" path="createaccount" component={CreateAccountForm} />
            <Route name="about" path="about" component={About} />
            <Route name="accounts" path="accounts" component={NoAccounts} />
          </Route>
          <Route component={Layout}>
            <Route name="transactions" path="transactions" component={Transactions} onEnter={requireAuth}>
              <Route name="transactions" path=":year" component={Transactions} onEnter={requireAuth} />
              <Route name="transactions" path=":year/:month" component={Transactions} onEnter={requireAuth} />
            </Route>
            <Route name="transaction" path="transaction" component={TransactionForm} onEnter={requireAuth} />
            <Route name="transaction" path="transaction/:id" component={TransactionForm} onEnter={requireAuth} />
            <Route name="changes" path="changes" component={Changes} onEnter={requireAuth} />
            <Route name="categories" path="categories" component={Categories} onEnter={requireAuth}>
              <Route name="category" path=":id" component={Category} onEnter={requireAuth} />
            </Route>
            <Route name="settings" path="settings" component={Settings} onEnter={requireAuth} />
            <Route name="logout" path="logout" component={Logout} />
          </Route>
        </Route>
      </Router>
    );
  }
}

export default Routes;
