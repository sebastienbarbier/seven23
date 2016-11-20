
import {
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
  CHANGE_EVENT,
  ADD_EVENT,
  DELETE_EVENT,
  UPDATE_EVENT,
  LOGIN
} from '../constants';

import dispatcher from '../dispatcher/AppDispatcher';
import AccountStore from '../stores/AccountStore';
import storage from '../storage';
import { EventEmitter } from 'events';
import axios from 'axios';

let isLoading = true;
let objectStore = null;

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

  emitUpdate(args) {
    this.emit(UPDATE_EVENT, args);
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

  isLoading() {
    return isLoading;
  }

  initialize() {
    return axios({
        url: '/api/v1/debitscredits',
        method: 'get',
        headers: {
          'Authorization': 'Token '+ localStorage.getItem('token'),
        },
      })
      .then(function(response) {

        // Let us open our database
        var customerObjectStore  = storage.db.transaction("transactions", "readwrite").objectStore("transactions");
        customerObjectStore.clear();
        var counter = 0;
        for (var i in response.data) {
          response.data[i].year = response.data[i].date.slice(0,4);
          response.data[i].yearmonth = response.data[i].date.slice(0,7);
          var request = customerObjectStore.add(response.data[i])
          request.onsuccess = function(event) {
            counter++;
            if (counter === response.data.length) {
              isLoading = false;
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
    isLoading= true;
    storage.db.transaction("transactions", "readwrite").objectStore("transactions").clear();
    return Promise.resolve();
  }

}

let TransactionStoreInstance = new TransactionStore();

TransactionStoreInstance.dispatchToken = dispatcher.register(action => {

  switch(action.type) {

    case TRANSACTIONS_READ_REQUEST:

      var index = null; // criteria
      var keyRange = null; // values
      var transactions = []; // List of transactions to return

      // If no category
      if (action.category) {
        index = storage
                .db
                .transaction("transactions")
                .objectStore("transactions")
                .index("category");
        keyRange = IDBKeyRange.only(parseInt(action.category));
      } else if (action.year) {
        if (action.month) {
          index = storage
                  .db
                  .transaction("transactions")
                  .objectStore("transactions")
                  .index("yearmonth");
          keyRange = IDBKeyRange.only(action.year + '-' + action.month);
        } else {
          index = storage
                  .db
                  .transaction("transactions")
                  .objectStore("transactions")
                  .index("year");
          keyRange = IDBKeyRange.only(action.year);
        }
      } else {
        return;
      }

      // Request transactions based on criteria
      index
        .openCursor(keyRange)
        .onsuccess = function(event) {
          var cursor = event.target.result;

          if (cursor) {
            transactions.push(event.target.result.value);
            cursor.continue();
          } else {
            var counter = 0;
            if (transactions.length === 0) {
              TransactionStoreInstance.emitChange([]);
            }

            transactions.forEach((transaction) => {
              if (transaction['local_currency'] !== AccountStore.selectedAccount().currency) {

                // get change node and define ratio
                storage
                  .db
                  .transaction("changes")
                  .objectStore("changes")
                  .index("date")
                  .openCursor(IDBKeyRange.upperBound(transaction.date), "prev")
                  .onsuccess = function(event) {

                    counter++;

                    if (event.target.result) {
                      var change = event.target.result.value;
                      // Check if a exchange rate exist
                      if (change.rates.has(transaction['local_currency']) &&
                          change.rates.get(transaction['local_currency']).has(AccountStore.selectedAccount().currency)) {
                        transaction['foreign_amount'] = transaction['local_amount'] * change.rates.get(transaction['local_currency']).get(AccountStore.selectedAccount().currency);
                      } else {
                        delete transaction['foreign_amount'];
                      }
                    }

                    if (counter === transactions.length) {
                      // If cursor is null, end of loop so we emitChange
                      TransactionStoreInstance.emitChange(transactions.sort((a, b) => {
                        return a.date < b.date;
                      }));
                    }
                  };
              } else {

                counter++;
                transaction['foreign_amount'] = transaction['local_amount'];
                // EmitChange if all element have same currency
                if (counter === transactions.length) {
                  // If cursor is null, end of loop so we emitChange
                  TransactionStoreInstance.emitChange(transactions.sort((a, b) => {
                    return a.date < b.date;
                  }));
                }
              } //endif
            }); // endfor
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
        data: action.transaction
      })
      .then((response) => {
        var customerObjectStore  = storage.db.transaction("transactions", "readwrite").objectStore("transactions");
        response.data.year = response.data.date.slice(0,4);
        response.data.yearmonth = response.data.date.slice(0,7);
        var request = customerObjectStore.add(response.data)
          request.onsuccess = function(event) {
            TransactionStoreInstance.emitAdd(response.data);
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
        url: '/api/v1/debitscredits/' + action.transaction.id,
        method: 'PUT',
        headers: {
          'Authorization': 'Token '+ localStorage.getItem('token'),
        },
        data: action.transaction
      })
      .then((response) => {
        var customerObjectStore  = storage.db.transaction("transactions", "readwrite").objectStore("transactions");
        customerObjectStore.delete(action.transaction.id);
        response.data.year = response.data.date.slice(0,4);
        response.data.yearmonth = response.data.date.slice(0,7);
        var request = customerObjectStore.add(response.data);
        request.onsuccess = function(event) {
          TransactionStoreInstance.emitUpdate(response.data);
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
        var customerObjectStore  = storage.db.transaction("transactions", "readwrite").objectStore("transactions");
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
