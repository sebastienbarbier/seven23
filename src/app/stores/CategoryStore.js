import {
  CATEGORIES_CREATE_REQUEST,
  CATEGORIES_READ_REQUEST,
  CATEGORIES_UPDATE_REQUEST,
  CATEGORIES_DELETE_REQUEST,
  ADD_EVENT,
  UPDATE_EVENT,
  CHANGE_EVENT,
  DELETE_EVENT,
} from '../constants';

import dispatcher from '../dispatcher/AppDispatcher';
import { EventEmitter } from 'events';
import axios from 'axios';
import storage from '../storage';

import CategoryActions from '../actions/CategoryActions';

import Worker from '../workers/Categories.worker';

class CategoryStore extends EventEmitter {
  constructor() {
    super();
    // Initialize worker
    this.worker = new Worker();
    this.worker.onmessage = function(event) {
      // Receive message { type: ..., categoriesList: ..., categoriesTree: ... }
      switch (event.data.type) {
      case CATEGORIES_CREATE_REQUEST:
        break;
      case CATEGORIES_READ_REQUEST:
        if (event.data.categoriesList) {
          categoryStoreInstance.emitChange(
            event.data.categoriesList,
            event.data.categoriesTree,
          );
        } else if (event.data.category) {
          categoryStoreInstance.emitChange(event.data.category);
        }
        break;
      case CATEGORIES_UPDATE_REQUEST:
        break;
      case CATEGORIES_DELETE_REQUEST:
        break;
      default:
        return;
      }
    };
  }

  emitAdd(...args) {
    this.emit(ADD_EVENT, ...args);
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

  emitUpdate(...args) {
    this.emit(UPDATE_EVENT, ...args);
  }

  addUpdateListener(callback) {
    this.on(UPDATE_EVENT, callback);
  }

  removeUpdateListener(callback) {
    this.removeListener(UPDATE_EVENT, callback);
  }

  onceUpdateListener(callback) {
    this.once(UPDATE_EVENT, callback);
  }

  emitChange(...args) {
    this.emit(CHANGE_EVENT, ...args);
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

  addDeleteListener(callback) {
    this.on(DELETE_EVENT, callback);
  }

  removeDeleteListener(callback) {
    this.removeListener(DELETE_EVENT, callback);
  }

  emitDelete(...args) {
    this.emit(DELETE_EVENT, ...args);
  }

  onceDeleteListener(callback) {
    this.once(DELETE_EVENT, callback);
  }

  initialize() {
    return axios({
      url: '/api/v1/categories',
      method: 'get',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token'),
      },
    }).then(function(response) {
      // Load transactions store
      storage
        .connectIndexedDB()
        .then(connection => {
          var customerObjectStore = connection
            .transaction('categories', 'readwrite')
            .objectStore('categories');
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
        })
        .catch(function(ex) {
          console.error(ex);
        });
    });
  }

  reset() {
    return new Promise(resolve => {
      storage.connectIndexedDB().then(connection => {
        connection
          .transaction('categories', 'readwrite')
          .objectStore('categories')
          .clear();
        resolve();
      });
    });
  }
}

let categoryStoreInstance = new CategoryStore();

categoryStoreInstance.dispatchToken = dispatcher.register(action => {
  if ([CATEGORIES_READ_REQUEST].indexOf(action.type) !== -1) {
    // categoryStoreInstance.worker.postMessage(action);
  }

  switch (action.type) {
  case CATEGORIES_CREATE_REQUEST:
    if (action.category.parent === null) {
      delete action.category.parent;
    }
    // Create categories
    axios({
      url: '/api/v1/categories',
      method: 'POST',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token'),
      },
      data: action.category,
    })
      .then(response => {
        storage.connectIndexedDB().then(connection => {
          connection
            .transaction('categories', 'readwrite')
            .objectStore('categories')
            .add(response.data);
          categoryStoreInstance.emitAdd(response.data); // Trigger update event
        });
      })
      .catch(exception => {
        categoryStoreInstance.emitAdd(
          action.category,
          exception.response ? exception.response.data : null,
        );
      });
    break;
  case CATEGORIES_UPDATE_REQUEST:
    if (action.category.parent === null) {
      delete action.category.parent;
    }
    axios({
      url: '/api/v1/categories/' + action.category.id,
      method: 'PUT',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token'),
      },
      data: action.category,
    })
      .then(response => {
        storage.connectIndexedDB().then(connection => {
          connection
            .transaction('categories', 'readwrite')
            .objectStore('categories')
            .put(response.data);
          categoryStoreInstance.emitUpdate(response.data); // Trigger update event
        });
      })
      .catch(exception => {
        categoryStoreInstance.emitUpdate(
          action.category,
          exception.response ? exception.response.data : null,
        );
      });
    break;
  case CATEGORIES_DELETE_REQUEST:
    // Delete category
    axios({
      url: '/api/v1/categories/' + action.id,
      method: 'DELETE',
      headers: {
        Authorization: 'Token ' + localStorage.getItem('token'),
      },
    })
      .then(response => {
        categoryStoreInstance.onceChangeListener(() => {
          CategoryActions.read();
        });
        categoryStoreInstance.initialize();
      })
      .catch(exception => {
        categoryStoreInstance.emitDelete(
          exception.response ? exception.response.data : null,
        );
      });
    break;
  default:
    return;
  }
});

export default categoryStoreInstance;
