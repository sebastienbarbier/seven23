
import {
  CHANGES_CREATE_REQUEST,
  CHANGES_READ_REQUEST,
  CHANGES_UPDATE_REQUEST,
  CHANGES_DELETE_REQUEST,
  CHANGE_EVENT
} from '../constants';

import dispatcher from '../dispatcher/AppDispatcher';
import storage from '../storage';
import AccountStore from '../stores/AccountStore';
import { EventEmitter } from 'events';
import axios from 'axios';

import Worker from '../workers/Changes.worker';

let chainAccountId = null;
let chain = [];

class ChangeStore extends EventEmitter {

  constructor() {
    super();
    // Initialize worker
    this.worker = new Worker();
    this.worker.onmessage = function(event) {
      // Receive message { type: ..., changes: ... }
      switch(event.data.type){
        case CHANGES_CREATE_REQUEST:
          break;
        case CHANGES_READ_REQUEST:
          if (event.data.changes) {
            ChangeStoreInstance.emitChange(event.data.changes);
          }
          break;
          break;
        case CHANGES_UPDATE_REQUEST:
          break;
        case CHANGES_DELETE_REQUEST:
          break;
        default:
          return;
      };
    }
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

  initialize() {
    var that = this;
    return axios({
      url: '/api/v1/changes',
      method: 'get',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
    })
    .then(function(response) {
      // Load transactions store
      storage.connectIndexedDB().then((connection) => {
        var customerObjectStore = connection.transaction('changes', 'readwrite').objectStore('changes');
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
              ChangeStoreInstance.emitChange();
            }
          };
          request.onerror = function(event) {
            console.error(event);
          };
        }
      });

    }).catch(function(ex) {
      console.error(ex);
    });
  }

  reset() {
    return new Promise((resolve) => {
      chainAccountId = null;
      storage.connectIndexedDB().then((connection) => {
        connection.transaction('changes', 'readwrite').objectStore('changes').clear();
        resolve();
      });
    });
  }
}

let ChangeStoreInstance = new ChangeStore();

ChangeStoreInstance.dispatchToken = dispatcher.register(action => {

  if ([CHANGES_READ_REQUEST].indexOf(action.type) !== -1) {

    ChangeStoreInstance.worker.postMessage(action);

  }

  switch(action.type) {
  case CHANGES_CREATE_REQUEST:
      // Create categories
    axios({
      url: '/api/v1/changes',
      method: 'POST',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
      data: action.change
    })
      .then((response) => {
        if (response.data) {
          storage
              .db
              .transaction('changes', 'readwrite')
              .objectStore('changes')
              .put(response.data);
          ChangeStoreInstance.emitChange();
        } else {
          return Promise.reject();
        }
      })
      .catch((exception) => {
        ChangeStoreInstance.emitChange(exception.response ? exception.response.data : null);
      });
    break;
  case CHANGES_UPDATE_REQUEST:
      // Create categories
    axios({
      url: '/api/v1/changes/' + action.change.id,
      method: 'PUT',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
      data: action.change
    })
      .then((response) => {
        if (response.data) {
          storage
              .db
              .transaction('changes', 'readwrite')
              .objectStore('changes')
              .put(response.data);
          ChangeStoreInstance.emitChange();
        } else {
          return Promise.reject();
        }
      })
      .catch((exception) => {
        ChangeStoreInstance.emitChange(exception.response ? exception.response.data : null);
      });
    break;
  case CHANGES_DELETE_REQUEST:
    axios({
      url: '/api/v1/changes/' + action.change.id,
      method: 'DELETE',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      }
    })
      .then((response) => {
        storage
              .db
              .transaction('changes', 'readwrite')
              .objectStore('changes')
              .delete(action.change.id);
        ChangeStoreInstance.emitChange();
      })
      .catch((exception) => {
        console.error(exception);
      });
    break;
  default:
    return;
  }

});

export default ChangeStoreInstance;
