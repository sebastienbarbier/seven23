import {
  TRANSACTIONS_INIT_REQUEST,
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
  DB_NAME,
  DB_VERSION
} from '../constants';

import axios from 'axios';

onmessage = function(event) {

  // Action object is the on generated in action object
  const action = event.data;

  switch(action.type){
    case TRANSACTIONS_CREATE_REQUEST:
      axios({
        url: action.url + '/api/v1/debitscredits',
        method: 'POST',
        headers: {
          'Authorization': 'Token '+ action.token,
        },
        data: action.transaction
      })
      .then((response) => {

        // Populate data for indexedb indexes
        response.data.year = response.data.date.slice(0,4);
        response.data.month = response.data.date.slice(5,7);

        // Connect to indexedDB
        let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
        connectDB.onsuccess = function(event) {
          var customerObjectStore = event.target.result
                                      .transaction('transactions', 'readwrite')
                                      .objectStore('transactions');

          // Save new transaction
          var request = customerObjectStore.put(response.data);

          request.onsuccess = function(event) {
            postMessage({
              type: action.type,
              transaction: response.data
            });
          };
          request.onerror = function(event) {
            console.error(event);
          };
        };
        connectDB.onerror = function(event) {
          console.error(event);
        };
      }).catch((exception) => {
        postMessage({
          type: action.type,
          exception: exception.response ? exception.response.data : null
        });
      });
      break;
    case TRANSACTIONS_READ_REQUEST:

      let transactions = []; // Set object of Transaction

      let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
      connectDB.onsuccess = function(event) {

        let index = null; // criteria
        let keyRange = null; // values
        // If no category
        if (action.category) {
          index = event.target.result
                        .transaction('transactions')
                        .objectStore('transactions')
                        .index('category');
          keyRange = IDBKeyRange.only([action.account, parseInt(action.category)]);
        } else if (action.year && action.month) {
          index = event.target.result
                      .transaction('transactions')
                      .objectStore('transactions')
                      .index('month');
          keyRange = IDBKeyRange.only([action.account, '' + action.year, '' + action.month]);
        } else if (action.year) {
          index = event.target.result
                      .transaction('transactions')
                      .objectStore('transactions')
                      .index('year');
          keyRange = IDBKeyRange.only([action.account, '' + action.year]);
        } else {
          return;
        }

        // Request transactions based on criteria
        let cursor = index.openCursor(keyRange);
        cursor.onsuccess = function(event) {
          var cursor = event.target.result;

          if (cursor) {
            transactions.push(event.target.result.value);
            cursor.continue();
          } else {

            transactions.forEach((transaction) => {
              transaction.amount = transaction.local_amount;
            });

            postMessage({
              type: action.type,
              transactions: transactions,
            });

            // TO RE-IMPLEMENT CONVERT SYSTEM IN WEB WORKER :(
            // if (transactions.size === 0) {
            //   TransactionStoreInstance.emitChange(transactions);
            // }
            // let promises = []; // array of promises
            // let counter = 0;
            // transactions.forEach((transaction) => {
            //   if (transaction.currency !== AccountStore.selectedAccount().currency) {
            //     promises.push(transaction.convertTo(AccountStore.selectedAccount().currency));
            //   }
            //   counter++;
            //   if (counter === transactions.size) {
            //     Promise.all(promises).then(() => {
            //       TransactionStoreInstance.emitChange(transactions);
            //     });
            //   }
            // });
          }
        }; // end cursor.onsuccess
        cursor.onerror = function(event) {
          console.error(event);
        };
      }; // end connectDB.onsuccess
      connectDB.onerror = function(event) {
        console.error(event);
      };
      break;
    case TRANSACTIONS_UPDATE_REQUEST:
      axios({
        url: action.url + '/api/v1/debitscredits/' + action.transaction.id,
        method: 'PUT',
        headers: {
          'Authorization': 'Token '+ action.token,
        },
        data: action.transaction
      })
      .then((response) => {

        // Populate data for indexedb indexes
        response.data.year = response.data.date.slice(0,4);
        response.data.month = response.data.date.slice(5,7);

        // Connect to indexedDB
        let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
        connectDB.onsuccess = function(event) {
          var customerObjectStore = event.target.result
                                      .transaction('transactions', 'readwrite')
                                      .objectStore('transactions');

          // Save new transaction
          var request = customerObjectStore.put(response.data);

          request.onsuccess = function(event) {
            postMessage({
              type: action.type,
              transaction: action.transaction
            });
          };
          request.onerror = function(event) {
            console.error(event);
          };
        };
        connectDB.onerror = function(event) {
          console.error(event);
        };
      }).catch((exception) => {
        postMessage({
          type: action.type,
          exception: exception.response ? exception.response.data : null
        });
      });
      break;
    case TRANSACTIONS_DELETE_REQUEST:
      axios({
        url: action.url + '/api/v1/debitscredits/' + action.transaction.id,
        method: 'DELETE',
        headers: {
          'Authorization': 'Token '+ action.token,
        }
      })
      .then((response) => {
        // Connect to indexedDB
        let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
        connectDB.onsuccess = function(event) {
          var customerObjectStore = event.target.result
                                      .transaction('transactions', 'readwrite')
                                      .objectStore('transactions');

          // Save new transaction
          var request = customerObjectStore.delete(action.transaction.id);

          request.onsuccess = function(event) {

            postMessage({
              type: action.type,
              transaction: {
                id: action.transaction.id
              }
            });
          };
          request.onerror = function(event) {
            console.error(event);
          };
        };

      }).catch((exception) => {
        postMessage({
          type: action.type,
          exception: exception.response ? exception.response.data : null
        });
      });
      break;

    default:
      return;
    }
}