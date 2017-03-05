import dispatcher from '../dispatcher/AppDispatcher';

import {
  CATEGORIES_CREATE_REQUEST,
  CATEGORIES_READ_REQUEST,
  CATEGORIES_UPDATE_REQUEST,
  CATEGORIES_DELETE_REQUEST,
} from '../constants';

import AccountStore from '../stores/AccountStore';

var CategoryActions = {

  /**
   * @param  {string} category
   */
  create: (category) => {
    dispatcher.dispatch({
      type: CATEGORIES_CREATE_REQUEST,
      category: category
    });
  },

  read: (data = {}) => {
    dispatcher.dispatch({
      type: CATEGORIES_READ_REQUEST,
      account: data.account || AccountStore.selectedAccount().id,
      id: data.id,
    });
  },

  update: (category) => {
    dispatcher.dispatch({
      type: CATEGORIES_UPDATE_REQUEST,
      category: category
    });
  },

  delete: (id) => {
    dispatcher.dispatch({
      type: CATEGORIES_DELETE_REQUEST,
      id: id
    });
  },

};

export default CategoryActions;
