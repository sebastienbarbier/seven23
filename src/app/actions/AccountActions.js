import dispatcher from '../dispatcher/AppDispatcher';

import {
  ACCOUNTS_UPDATE_REQUEST,
} from "../constants";

var AccountActions = {

  update: (account) => {
    dispatcher.dispatch({
      type: ACCOUNTS_UPDATE_REQUEST,
      account: account,
    });
  },

};

export default AccountActions;
