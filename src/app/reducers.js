import { combineReducers } from 'redux';

import user from './reducers/user.reducer';
import server from './reducers/server.reducer';

import account from './reducers/account.reducer';
import categories from './reducers/categories.reducer';
import currencies from './reducers/currencies.reducer';
import transactions from './reducers/transactions.reducer';
import goals from './reducers/goals.reducer';
import changes from './reducers/changes.reducer';
import imports from './reducers/imports.reducer';
import state from './reducers/state.reducer';

const reducers = combineReducers({
  user,
  server,

  transactions,
  changes,
  categories,
  currencies,
  account,
  imports,
  goals,
  state,
});

export default reducers;