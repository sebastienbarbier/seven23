import dispatcher from '../dispatcher/AppDispatcher';

import {
  ACCOUNTS_UPDATE_REQUEST,
  ACCOUNTS_CREATE_REQUEST,
} from '../constants';

var AccountActions = {

  create: (account) => {
    dispatcher.dispatch({
      type: ACCOUNTS_CREATE_REQUEST,
      account: account,
    });
  },

  update: (account) => {
    dispatcher.dispatch({
      type: ACCOUNTS_UPDATE_REQUEST,
      account: account,
    });
  },

};

export default AccountActions;
