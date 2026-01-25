import { combineReducers } from "redux";

import server from "./reducers/server.reducer";
import user from "./reducers/user.reducer";

import account from "./reducers/account.reducer";
import accounts from "./reducers/accounts.reducer";
import app from "./reducers/app.reducer";
import categories from "./reducers/categories.reducer";
import changes from "./reducers/changes.reducer";
import currencies from "./reducers/currencies.reducer";
import dashboard from "./reducers/dashboard.reducer";
import report from "./reducers/report.reducer";
import state from "./reducers/state.reducer";
import sync from "./reducers/sync.reducer";
import transactions from "./reducers/transactions.reducer";
import taxReturns from "./reducers/taxReturns.reducer";
import notification from "./reducers/notification.reducer";




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
  report,
  taxReturns,
  notification
});

export default reducers;
