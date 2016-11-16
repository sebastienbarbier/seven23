import dispatcher from '../dispatcher/AppDispatcher';

import {
  CATEGORIES_CREATE_REQUEST,
  CATEGORIES_READ_REQUEST,
  CATEGORIES_UPDATE_REQUEST,
  CATEGORIES_DELETE_REQUEST,
} from "../constants";

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

  read: () => {
    dispatcher.dispatch({
      type: CATEGORIES_READ_REQUEST,
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
