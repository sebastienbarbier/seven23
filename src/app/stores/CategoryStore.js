
import {
  CATEGORIES_CREATE_REQUEST,
  CATEGORIES_READ_REQUEST,
  CATEGORIES_UPDATE_REQUEST,
  CATEGORIES_DELETE_REQUEST,
  CATEGORIES_RESET,
  ADD_EVENT,
  CHANGE_EVENT,
  DELETE_EVENT,
  LOGIN
} from '../constants';

import dispatcher from '../dispatcher/AppDispatcher';
import { EventEmitter } from 'events';
import axios from 'axios';

let categories = [];
let indexedCategories = {};

class CategoryStore extends EventEmitter {

  constructor() {
    super();
  }

  emitAdd(args) {
    this.emit(ADD_EVENT, args);
  }

  addAddListener(callback) {
    this.on(ADD_EVENT, callback);
  }

  removeAddListener(callback) {
    this.removeListener(ADD_EVENT, callback);
  }

  onceAddListener(callback) {
    this.once(ADD_EVENT, callback);
  }

  emitChange(args) {
    this.emit(CHANGE_EVENT, args);
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

  onceChangeListener(callback) {
    this.once(CHANGE_EVENT, callback);
  }

  getAllCategories() {
    return categories;
  }

  getIndexedCategories() {
    return indexedCategories;
  }

  initialize() {
    return axios({
        url: '/api/v1/categories',
        method: 'get',
        headers: {
          'Authorization': 'Token '+ localStorage.getItem('token'),
        },
      })
      .then(function(response) {
        // categories = response.data;
        // generate index view
        //
        categories = [];
        indexedCategories = {};

        response.data.forEach((item) => {
          item.children = [];
          indexedCategories[item.id] = item;
        });
        // Dispatch categories as tree
        response.data.forEach((item) => {
          if (item.parent) {
            indexedCategories[item.parent].children
            ? indexedCategories[item.parent].children.push(item)
            : indexedCategories[item.parent].children = [item];
          } else {
            categories.push(item);
          }
        });
        categoryStoreInstance.emitChange();
      }).catch(function(ex) {
        console.log('parsing failed', ex);
      });
  }

  reset() {
    return Promise.resolve().then(() => {
      categories = [];
      indexedCategories = {};
    });
  }

}

let categoryStoreInstance = new CategoryStore();

categoryStoreInstance.dispatchToken = dispatcher.register(action => {

  switch(action.type) {
    case CATEGORIES_READ_REQUEST:
      categoryStoreInstance.emitChange();
      break;
    case CATEGORIES_CREATE_REQUEST:
      if (action.category.parent === null) {
        delete action.category.parent;
      }
      // Create categories
      axios({
        url: '/api/v1/categories',
        method: 'POST',
        headers: {
          'Authorization': 'Token '+ localStorage.getItem('token'),
        },
        data: action.category
      })
      .then((response) => {

        categoryStoreInstance.initialize();

      }).catch((exception) => {
        categoryStoreInstance.emitChange(exception.response ? exception.response.data : null);
      });
      break;
    case CATEGORIES_UPDATE_REQUEST:
      if (action.category.parent === null) {
        delete action.category.parent;
      }
      axios({
        url: '/api/v1/categories/'+action.category.id,
        method: 'PUT',
        headers: {
          'Authorization': 'Token '+ localStorage.getItem('token'),
        },
        data: action.category
      })
      .then((response) => {
        categoryStoreInstance.initialize();
      }).catch((exception) => {
        categoryStoreInstance.emitChange(exception.response ? exception.response.data : null);
      });
      break;
    case CATEGORIES_DELETE_REQUEST:
      // Delete category
      axios({
        url: '/api/v1/categories/'+action.id,
        method: 'DELETE',
        headers: {
          'Authorization': 'Token '+ localStorage.getItem('token'),
        }
      })
      .then((response) => {
        if (response.data.id) {
          indexedCategories[action.id].active = false;
        } else {
          delete indexedCategories[action.id];
          categories = categories.filter((i) => {
            return i.id != action.id;
          });
        }
        categoryStoreInstance.emitChange(response.data);
      }).catch((exception) => {
        categoryStoreInstance.emitChange(exception.response ? exception.response.data : null);
      });
      break;
    default:
      return;
  }

});

export default categoryStoreInstance;
