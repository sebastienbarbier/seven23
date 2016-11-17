import React, {Component} from 'react';
import { render } from 'react-dom'
import { Router, Route, Link, browserHistory, Redirect } from 'react-router'

import Main from './main'
import Login from './components/Login';
import Logout from './components/Logout';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Changes from './components/Changes';
import Transactions from './components/Transactions';
import TransactionForm from './components/transactions/TransactionForm';
import Categories from './components/Categories';
import Category from './components/Category';
import CategoryDelete from './components/categories/CategoryDelete';
import Settings from './components/Settings';
import auth from './auth';

function requireAuth(nextState, replace) {
  if (!auth.loggedIn())
    replace({
      pathname: 'login',
      state: { nextPathname: nextState.location.pathname }
    })
}

class Routes extends Component {

  // <Route name="dashboard" path="dashboard" component={Dashboard} onEnter={requireAuth} />
  render() {
    return (
      <Router history={browserHistory}>
    	<Redirect from="/" to="/transactions" />
	    <Route component={Main}>
		    <Route name="login" path="/login" component={Login} />
	    	<Route component={Layout}>
		    	<Route name="transactions" path="transactions" component={Transactions} onEnter={requireAuth}>
			    	<Route name="transactions" path=":year" component={Transactions} onEnter={requireAuth} />
			    	<Route name="transactions" path=":year/:month" component={Transactions} onEnter={requireAuth} />
		    	</Route>
		    	<Route name="transaction" path="transaction" component={TransactionForm} onEnter={requireAuth} />
		    	<Route name="transaction" path="transaction/:id" component={TransactionForm} onEnter={requireAuth} />
		    	<Route name="changes" path="changes" component={Changes} onEnter={requireAuth} />
		    	<Route name="categoryEdit" path="categories/:id/delete" component={CategoryDelete} onEnter={requireAuth} />
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
