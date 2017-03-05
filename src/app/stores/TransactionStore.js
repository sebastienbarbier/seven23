
import {
  TRANSACTIONS_INIT_REQUEST,
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
  CHANGE_EVENT,
  ADD_EVENT,
  DELETE_EVENT,
  UPDATE_EVENT,
} from '../constants';

import dispatcher from '../dispatcher/AppDispatcher';
import AccountStore from '../stores/AccountStore';
import storage from '../storage';
import { EventEmitter } from 'events';
import axios from 'axios';
// Import models
import TransactionModel from '../models/Transaction';

import Worker from '../workers/Transactions.worker';

class TransactionStore extends EventEmitter {

  constructor() {
    super();
    // Initialize worker
    this.worker = new Worker();
    this.worker.onmessage = function(event) {
      // Receive message { type: ..., transaction: ..., transactions: ... }
      switch(event.data.type){
        case TRANSACTIONS_CREATE_REQUEST:
          if (event.data.transaction) {
            TransactionStoreInstance.emitAdd(event.data.transaction);
          } else if (event.data.exception) {
            TransactionStoreInstance.emitAdd(event.data.exception);
          }
          break;
        case TRANSACTIONS_READ_REQUEST:
          if (event.data.transactions) {
            TransactionStoreInstance.emitChange(event.data.transactions);
          }
          break;
        case TRANSACTIONS_UPDATE_REQUEST:
          if (event.data.transaction) {
            TransactionStoreInstance.emitUpdate(event.data.transaction);
          } else if (event.data.exception) {
            TransactionStoreInstance.emitUpdate(event.data.exception);
          }
          break;
        case TRANSACTIONS_DELETE_REQUEST:
          if (event.data.transaction) {
            TransactionStoreInstance.emitDelete(event.data.transaction);
          } else if (event.data.exception) {
            TransactionStoreInstance.emitDelete(event.data.exception);
          }
          break;
        default:
          return;
      };
    }
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

  emitUpdate(oldObject, newObject) {
    this.emit(UPDATE_EVENT, oldObject, newObject);
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

  emitDelete(args) {
    this.emit(DELETE_EVENT, args);
  }

  addDeleteListener(callback) {
    this.on(DELETE_EVENT, callback);
  }

  removeDeleteListener(callback) {
    this.removeListener(DELETE_EVENT, callback);
  }

  onceDeleteListener(callback) {
    this.once(DELETE_EVENT, callback);
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

  /**
   * Load complete set of data from server and store locally with indexed value (year, monthyear)
   * TODO : Would be nice to just load changes, not all data.
   * @return {Promise}
   */
  initialize() {

    return axios({
      url: '/api/v1/debitscredits',
      method: 'get',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
    })
      .then(function(response) {
        // Load transactions store
        var customerObjectStore  = storage.db.transaction('transactions', 'readwrite').objectStore('transactions');
        // Delete all previous objects
        customerObjectStore.clear();
        var counter = 0;
        // For each object retrieved by our request.
        for (var i in response.data) {
          // Generate indexes to easy load per month and per year.
          response.data[i].year = response.data[i].date.slice(0,4);
          response.data[i].month = response.data[i].date.slice(5,7);
          // Save in storage.
          var request = customerObjectStore.add(response.data[i]);
          request.onsuccess = function(event) {
            counter++;
            // On last success, we trigger an event.
            if (counter === response.data.length) {
              TransactionStoreInstance.emitChange();
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
    return new Promise((resolve) => {
      storage.db.transaction('transactions', 'readwrite').objectStore('transactions').clear();
      resolve();
    });
  }
}

let TransactionStoreInstance = new TransactionStore();

TransactionStoreInstance.dispatchToken = dispatcher.register(action => {

  if ([TRANSACTIONS_CREATE_REQUEST,
       TRANSACTIONS_READ_REQUEST,
       TRANSACTIONS_UPDATE_REQUEST,
       TRANSACTIONS_DELETE_REQUEST].indexOf(action.type) !== -1) {

    TransactionStoreInstance.worker.postMessage(action);

  }

});

export default TransactionStoreInstance;
