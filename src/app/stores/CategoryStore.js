
import {
  CATEGORIES_CREATE_REQUEST,
  CATEGORIES_READ_REQUEST,
  CATEGORIES_UPDATE_REQUEST,
  CATEGORIES_DELETE_REQUEST,
  ADD_EVENT,
  CHANGE_EVENT
} from '../constants';

import dispatcher from '../dispatcher/AppDispatcher';
import { EventEmitter } from 'events';
import axios from 'axios';
import storage from '../storage';
import AccountStore from '../stores/AccountStore';

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

  initialize() {
    return axios({
      url: '/api/v1/categories',
      method: 'get',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
    })
      .then(function(response) {
        // Load transactions store
        var customerObjectStore  = storage.db.transaction('categories', 'readwrite').objectStore('categories');
        // Delete all previous objects
        customerObjectStore.clear();
        var counter = 0;
        // For each object retrieved by our request.
        for (var i in response.data) {
          // Save in storage.
          var request = customerObjectStore.add(response.data[i]);
          request.onsuccess = function(event) {
            counter++;
            // On last success, we trigger an event.
            if (counter === response.data.length) {
              categoryStoreInstance.emitChange();
            }
          };
          request.onerror = function(event) {
            console.error(event);
          };
        }
      }).catch(function(ex) {
        console.error(ex);
      });
  }

  reset() {
    return Promise.resolve();
  }

}

let categoryStoreInstance = new CategoryStore();

categoryStoreInstance.dispatchToken = dispatcher.register(action => {

  switch(action.type) {
  case CATEGORIES_READ_REQUEST:
    let index = null; // criteria
    let keyRange = null; // values
    let categories = []; // Set object of Transaction

    if (action.id) {
      index = storage
                .db
                .transaction('categories')
                .objectStore('categories')
                .get(parseInt(action.id))
      index.onsuccess = (event) => {
        categoryStoreInstance.emitChange(index.result);
      };
    } else {
      index = storage
                .db
                .transaction('categories')
                .objectStore('categories')
                .index('account');
      keyRange = IDBKeyRange.only(AccountStore.selectedAccount().id);
      let cursor = index.openCursor(keyRange);
      cursor.onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          categories.push(event.target.result.value);
          cursor.continue();
        } else {
          categoryStoreInstance.emitChange(categories);
        }
      };
    }
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
        if (response.data.parent) {
          indexedCategories[response.data.parent].children = indexedCategories[response.data.parent].children.filter((i) => {
            return i.id != action.id;
          });
        } else {
          categories = categories.filter((i) => {
            return i.id != action.id;
          });
        }

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
