
import {
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

class TransactionStore extends EventEmitter {

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
    storage.db.transaction('transactions', 'readwrite').objectStore('transactions').clear();
    return Promise.resolve();
  }

}

let TransactionStoreInstance = new TransactionStore();

TransactionStoreInstance.dispatchToken = dispatcher.register(action => {

  switch(action.type){
  case TRANSACTIONS_READ_REQUEST:

    let index = null; // criteria
    let keyRange = null; // values
    let transactions = new Set(); // Set object of Transaction

    // If no category
    if (action.category) {
      index = storage
                  .db
                  .transaction('transactions')
                  .objectStore('transactions')
                  .index('category');
      keyRange = IDBKeyRange.only([AccountStore.selectedAccount().id, parseInt(action.category)]);
    } else if (action.year) {
      if (action.month) {
        index = storage
                    .db
                    .transaction('transactions')
                    .objectStore('transactions')
                    .index('month');
        keyRange = IDBKeyRange.only([AccountStore.selectedAccount().id, '' + action.year, '' + action.month]);
      } else {
        index = storage
                    .db
                    .transaction('transactions')
                    .objectStore('transactions')
                    .index('year');
        keyRange = IDBKeyRange.only([AccountStore.selectedAccount().id, '' + action.year]);
      }
    } else {
      return;
    }

    // Request transactions based on criteria
    let cursor = index.openCursor(keyRange);
    cursor.onsuccess = function(event) {
      var cursor = event.target.result;

      if (cursor) {
        let ref = new TransactionModel(event.target.result.value);
        transactions.add(ref);
        cursor.continue();
      } else {
        if (transactions.size === 0) {
          TransactionStoreInstance.emitChange(transactions);
        }
        let promises = []; // array of promises
        let counter = 0;
        transactions.forEach((transaction) => {
          if (transaction.currency !== AccountStore.selectedAccount().currency) {
            promises.push(transaction.convertTo(AccountStore.selectedAccount().currency));
          }
          counter++;
          if (counter === transactions.size) {
            Promise.all(promises).then(() => {
              TransactionStoreInstance.emitChange(transactions);
            });
          }
        });
      }
    };
    break;
  case TRANSACTIONS_CREATE_REQUEST:
    axios({
      url: '/api/v1/debitscredits',
      method: 'POST',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
      data: action.transaction.toJSON()
    })
        .then((response) => {
          var customerObjectStore  = storage.db.transaction('transactions', 'readwrite').objectStore('transactions');
          response.data.year = response.data.date.slice(0,4);
          response.data.month = response.data.date.slice(5,7);
          var request = customerObjectStore.add(response.data);
          request.onsuccess = function(event) {
            let result = new TransactionModel(response.data);
            result.convertTo(action.transaction.currency).then(() => {
              TransactionStoreInstance.emitAdd(result);
            });

          };
          request.onerror = function(event) {
            console.error(event);
          };
        }).catch((exception) => {
          TransactionStoreInstance.emitAdd(exception.response ? exception.response.data : null);
        });
    break;
  case TRANSACTIONS_UPDATE_REQUEST:
    axios({
      url: '/api/v1/debitscredits/' + action.oldTransaction.id,
      method: 'PUT',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
      data: action.newTransaction.toJSON()
    })
        .then((response) => {
          var customerObjectStore  = storage.db.transaction('transactions', 'readwrite').objectStore('transactions');
          customerObjectStore.delete(action.oldTransaction.id);
          response.data.year = response.data.date.slice(0,4);
          response.data.month = response.data.date.slice(5,7);
          var request = customerObjectStore.add(response.data);
          request.onsuccess = function(event) {
            TransactionStoreInstance.emitUpdate(action.oldTransaction, action.newTransaction);
          };
          request.onerror = function(event) {
            console.error(event);
          };
        }).catch((exception) => {
          TransactionStoreInstance.emitUpdate(exception.response ? exception.response.data : null);
        });
    break;
  case TRANSACTIONS_DELETE_REQUEST:
    axios({
      url: '/api/v1/debitscredits/' + action.transaction.id,
      method: 'DELETE',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      }
    })
    .then((response) => {
      var customerObjectStore  = storage.db.transaction('transactions', 'readwrite').objectStore('transactions');
      var request = customerObjectStore.delete(action.transaction.id);
      request.onsuccess = function(event) {
        delete action.transaction.id;
        if (action.transaction.category !== undefined) {
          delete action.transaction.category;
        }
        delete action.transaction.foreign_amount;
        delete action.transaction.foreign_currency;
        TransactionStoreInstance.emitDelete(action.transaction);
      };
      request.onerror = function(event) {
        console.error(event);
      };
    }).catch((exception) => {
      console.error(event);
    });
    break;
  default:
    return;
  }

});

export default TransactionStoreInstance;
