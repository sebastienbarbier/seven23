import dispatcher from '../dispatcher/AppDispatcher';

import {
  CHANGES_CREATE_REQUEST,
  CHANGES_READ_REQUEST,
  CHANGES_UPDATE_REQUEST,
  CHANGES_DELETE_REQUEST,
} from "../constants";

var ChangesActions = {

  /**
   * @param  {string} change
   */
  create: (change) => {
    dispatcher.dispatch({
      type: CHANGES_CREATE_REQUEST,
      change: change
    });
  },

  read: (id) => {
    dispatcher.dispatch({
      type: CHANGES_READ_REQUEST,
      id: id
    });
  },

  update: (change) => {
    dispatcher.dispatch({
      type: CHANGES_UPDATE_REQUEST,
      change: change
    });
  },

  delete: (change) => {
    dispatcher.dispatch({
      type: CHANGES_DELETE_REQUEST,
      change: change
    });
  },

};

export default ChangesActions;
