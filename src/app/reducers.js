import { combineReducers } from 'redux';

import user from './reducers/user.reducer';
import server from './reducers/server.reducer';

import accounts from './reducers/accounts.reducer';
import categories from './reducers/categories.reducer';
import currencies from './reducers/currencies.reducer';
import transactions from './reducers/transactions.reducer';
import changes from './reducers/changes.reducer';

const reducers = combineReducers({
  user,
  server,

  transactions,
  changes,
  categories,
  currencies,
  accounts,
});

export default reducers;