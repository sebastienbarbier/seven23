
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
import moment from 'moment';

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
          console.log('TRANSACTIONS_CREATE_REQUEST', event.data);
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
    this.worker.onError = function(event) {
      console.log(event);
    }
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

  // On start we retrieve all transactions
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
        storage.connectIndexedDB().then((connection) => {

          var customerObjectStore  = connection.transaction('transactions', 'readwrite').objectStore('transactions');
          // Delete all previous objects
          customerObjectStore.clear();
          var counter = 0;

          const addObject = (i) => {
            var obj = i.next();
            if (obj && obj.value) {

              obj = obj.value[1];

              obj.year = obj.date.slice(0,4);
              obj.month = obj.date.slice(5,7);
              obj.day = obj.date.slice(8,10);
              obj.date = new Date(Date.UTC(obj.year, obj.month - 1, obj.day, 0, 0, 0));

              if (!obj.category) {
                delete obj.category;
              }

              var request = customerObjectStore.add(obj);
              request.onsuccess = function(event) {
                addObject(i);
              };
              request.onerror = function(event) {
                console.error(event);
              };
            } else {
              TransactionStoreInstance.emitChange();
            }
          };

          var iterator = response.data.entries();
          addObject(iterator);

        });

      }).catch(function(ex) {
        console.error(ex);
      });
  }

  reset() {
    return new Promise((resolve) => {
      storage.connectIndexedDB().then((connection) => {
        connection.transaction('transactions', 'readwrite').objectStore('transactions').clear();
        resolve();
      });
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
