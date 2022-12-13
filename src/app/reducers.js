import { combineReducers } from "redux";

import user from "./reducers/user.reducer";
import server from "./reducers/server.reducer";

import account from "./reducers/account.reducer";
import accounts from "./reducers/accounts.reducer";
import categories from "./reducers/categories.reducer";
import currencies from "./reducers/currencies.reducer";
import transactions from "./reducers/transactions.reducer";
import changes from "./reducers/changes.reducer";
import state from "./reducers/state.reducer";
import sync from "./reducers/sync.reducer";
import report from "./reducers/report.reducer";
import app from "./reducers/app.reducer";
import dashboard from "./reducers/dashboard.reducer";

const reducers = combineReducers({
  user,
  server,
  app,
  sync,
  dashboard,
  transactions,
  changes,
  categories,
  currencies,
  accounts,
  account,
  state,
  report
});

export default reducers;
