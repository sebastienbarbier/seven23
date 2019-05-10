import { combineReducers } from 'redux';

import user from './reducers/user.reducer';
import server from './reducers/server.reducer';

import account from './reducers/account.reducer';
import categories from './reducers/categories.reducer';
import currencies from './reducers/currencies.reducer';
import transactions from './reducers/transactions.reducer';
import changes from './reducers/changes.reducer';
import imports from './reducers/imports.reducer';
import state from './reducers/state.reducer';
import sync from './reducers/sync.reducer';
import report from './reducers/report.reducer';
import app from './reducers/app.reducer';

const reducers = combineReducers({
  user,
  server,
  app,
  sync,

  transactions,
  changes,
  categories,
  currencies,
  account,
  imports,
  state,
  report,
});

export default reducers;