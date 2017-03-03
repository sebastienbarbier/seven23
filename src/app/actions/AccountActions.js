import dispatcher from '../dispatcher/AppDispatcher';

import {
  ACCOUNTS_UPDATE_REQUEST,
  ACCOUNTS_CREATE_REQUEST,
  ACCOUNTS_DELETE_REQUEST,
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

  delete: (id) => {
    dispatcher.dispatch({
      type: ACCOUNTS_DELETE_REQUEST,
      id: id,
    });
  },

};

export default AccountActions;
