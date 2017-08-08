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

var firstRating = new Map();

function convertTo(transaction, currencyId, accountId) {

  return new Promise((resolve, reject) => {
    try {
      if (currencyId === transaction.originalCurrency) {
        transaction.isConversionAccurate = true;
        transaction.amount = transaction.originalAmount;
        resolve();
      } else {
        getChangeChain(accountId).then((chain) => {

          const result = chain.find((item) => {
            return item.date <= transaction.date;
          });

          transaction.currency = currencyId;
          transaction.isConversionAccurate = false;
          transaction.isConversionFromFuturChange = false;
          transaction.isSecondDegreeRate = false;
          if (result) {
            var change = result;
            // If exchange rate exist, we calculate exact change rate
            if (change.rates.has(transaction.originalCurrency) &&
                change.rates.get(transaction.originalCurrency).has(currencyId)) {
              transaction.isConversionAccurate = true;
              transaction.amount = transaction.originalAmount * change.rates.get(transaction.originalCurrency).get(currencyId);
            } else {
             // We take first Rating is available
              if (change.secondDegree.has(transaction.originalCurrency) &&
                  change.secondDegree.get(transaction.originalCurrency).has(currencyId)) {
                transaction.isSecondDegreeRate = true;
                transaction.amount = transaction.originalAmount * change.secondDegree.get(transaction.originalCurrency).get(currencyId);
              } else {
                // We take secondDegree transaction if possible
                if (firstRating.has(transaction.originalCurrency) &&
                    firstRating.get(transaction.originalCurrency).has(currencyId)) {
                  transaction.isConversionFromFuturChange = true;
                  transaction.amount = transaction.originalAmount * firstRating.get(transaction.originalCurrency).get(currencyId);
                } else {
                  // There is no transaciton, and no second degree.
                  // Right now, we do not check third degree.
                  transaction.amount = null;
                }
              }
            }
            resolve();
          } else {
            transaction.amount = null;
            resolve();
          }
        })
        .catch((exception) => {
          console.error(exception);
          reject(exception);
        });
      }
    } catch (exception) {
      console.error(exception);
      reject(exception);
    }
  });
}

onmessage = function(event) {

  // Action object is the on generated in action object
  const action = event.data;

  switch(action.type){
    case TRANSACTIONS_CREATE_REQUEST:

      // API return 400 if catery = null
      if (!action.transaction.category) { delete action.transaction.category; }

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
            let transaction = {
              id                         : response.data.id,
              user                       : response.data.user,
              account                    : response.data.account,
              name                       : response.data.name,
              date                       : response.data.date,
              originalAmount             : response.data.local_amount,
              originalCurrency           : response.data.local_currency,
              category                   : response.data.category,
              // Calculated value
              isConversionAccurate       : true, // Define is exchange rate is exact or estimated
              isConversionFromFuturChange: false, // If we used future change to make calculation
              isSecondDegreeRate         : false, // If we used future change to make calculation
              amount                     : response.data.local_amount,
              currency                   : response.data.local_currency,
            };
            convertTo(transaction, action.currency, response.data.account).then(() => {
              postMessage({
                type: action.type,
                transaction: transaction
              });
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
            transactions.push({
              id                         : cursor.value.id,
              user                       : cursor.value.user,
              account                    : cursor.value.account,
              name                       : cursor.value.name,
              date                       : cursor.value.date,
              originalAmount             : cursor.value.local_amount,
              originalCurrency           : cursor.value.local_currency,
              category                   : cursor.value.category,
              // Calculated value
              isConversionAccurate       : true, // Define is exchange rate is exact or estimated
              isConversionFromFuturChange: false, // If we used future change to make calculation
              isSecondDegreeRate         : false, // If we used future change to make calculation
              amount                     : cursor.value.local_amount,
              currency                   : cursor.value.local_currency,
            });
            cursor.continue();
          } else {

            if (transactions.length === 0) {
              postMessage({
                type: action.type,
                transactions: transactions,
              });
            }

            let promises = [];
            let counter = 0;

            transactions.forEach((transaction) => {
              promises.push(convertTo(transaction, action.currency, action.account));
              counter++;
              if (counter === transactions.length) {

                Promise.all(promises).then(() => {
                  postMessage({
                    type: action.type,
                    transactions: transactions,
                  });
                });
              }
            });
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

      // API return 400 if catery = null
      if (!action.transaction.category) { delete action.transaction.category; }

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
            let transaction = {
              id                         : response.data.id,
              user                       : response.data.user,
              account                    : response.data.account,
              name                       : response.data.name,
              date                       : response.data.date,
              originalAmount             : response.data.local_amount,
              originalCurrency           : response.data.local_currency,
              category                   : response.data.category,
              // Calculated value
              isConversionAccurate       : true, // Define is exchange rate is exact or estimated
              isConversionFromFuturChange: false, // If we used future change to make calculation
              isSecondDegreeRate         : false, // If we used future change to make calculation
              amount                     : response.data.local_amount,
              currency                   : response.data.local_currency,
            };

            convertTo(transaction, action.currency, action.transaction.account)
            .then(() => {
              postMessage({
                type: action.type,
                transaction: transaction
              });
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


function getChangeChain(accountId) {
  return new Promise((resolve, reject) => {
    var chain = [];
    var counter = 0;
    var lastItem = {};
    var changes = [];


    let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
    connectDB.onsuccess = function(event) {

      var index = event.target.result
                .transaction('changes')
                .objectStore('changes')
                .index('account');

      var keyRange = IDBKeyRange.only(parseInt(accountId));
      let cursor = index.openCursor(keyRange);

      cursor.onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          changes.push(event.target.result.value);
          cursor.continue();
        } else {

          changes = changes.sort((a, b) => {
            return a.date > b.date ? 1 : -1;
          });

          for (var i in changes) {
            var item = {
              id: changes[i].id,
              account: changes[i].account,
              date: changes[i].date,
              rates: new Map(lastItem.rates),
              secondDegree: new Map(lastItem.secondDegree),
            };

            // GENERATE FIRST RATING
            // If first time using this localCurrency
            if (item.rates.get(changes[i]['local_currency']) === undefined) {
              firstRating.set(changes[i]['local_currency'], new Map());
            }
            if (firstRating.get(changes[i]['local_currency']).get(changes[i]['new_currency']) === undefined) {
              firstRating.get(changes[i]['local_currency']).set(changes[i]['new_currency'], changes[i]['exchange_rate']);
            }

            // If first time using this new Currency
            if (item.rates.get(changes[i]['new_currency']) === undefined) {
              firstRating.set(changes[i]['new_currency'], new Map());
            }
            if (firstRating.get(changes[i]['new_currency']).get(changes[i]['local_currency']) === undefined) {
              firstRating.get(changes[i]['new_currency']).set(changes[i]['local_currency'], 1/changes[i]['exchange_rate']);
            }

            // GENERERATE CHAIN ITEM
            item.rates.set(changes[i]['local_currency'], new Map(item.rates.get(changes[i]['local_currency'])));
            item.rates.get(changes[i]['local_currency']).set(changes[i]['new_currency'], changes[i]['exchange_rate']);

            item.rates.set(changes[i]['new_currency'], new Map(item.rates.get(changes[i]['new_currency'])));
            item.rates.get(changes[i]['new_currency']).set(changes[i]['local_currency'], 1/changes[i]['exchange_rate']);

            // CALCULATE CROSS REFERENCE RATE WITH MULTI CURRENCY VALUES
            //
            // console.log('rates');
            // console.log(JSON.stringify(item.rates));
            // We take
            //
            // Algo:
            //  1 -> 2 -> 3
            //    x    y
            //  1 is changes[i]['local_currency']
            //  2 is changes[i]['new_currency']
            //  x is exchange rate between 1 and 2
            //  we need to calculate y and save it as 1 -> 3
            item.rates.get(changes[i]['local_currency']).forEach((value, key) => {
              if (key !== changes[i]['new_currency']) {
                item.rates.get(key);
                // console.log('local to key');
                // console.log(changes[i]['local_currency'] + ' > ' + key + ' > ' + changes[i]['new_currency'] );
                // console.log(changes[i]['local_currency'] + ' > ' + changes[i]['new_currency'] + ' : ' + changes[i]['exchange_rate'] );
                // console.log(changes[i]['local_currency'] + ' > ' + key + ' : ' + item.rates.get(changes[i]['local_currency']).get(key) );
                // console.log(key + ' > ' + changes[i]['new_currency'] + ' : ' + changes[i]['exchange_rate'] / value );
                // console.log(changes[i]['new_currency'] + ' > ' + key + ' : ' + 1/(changes[i]['exchange_rate'] / value));

                if (item.secondDegree.get(key) === undefined) {
                  item.secondDegree.set(key, new Map());
                }
                item.secondDegree.get(key).set(changes[i]['new_currency'], changes[i]['exchange_rate'] / value);

                if (item.secondDegree.get(changes[i]['new_currency']) === undefined) {
                  item.secondDegree.set(changes[i]['new_currency'], new Map());
                }
                item.secondDegree.get(changes[i]['new_currency']).set(key, 1/(changes[i]['exchange_rate'] / value));

                // We also need to update firstRate with this new value ... sad :(
                if (firstRating.get(key) === undefined) {
                  firstRating.set(key, new Map());
                }
                if (firstRating.get(key).get(changes[i]['new_currency']) === undefined) {
                  firstRating.get(key).set(changes[i]['new_currency'], changes[i]['exchange_rate'] / value);
                }

                if (firstRating.get(changes[i]['new_currency']) === undefined) {
                  firstRating.set(changes[i]['new_currency'], new Map());
                }
                if (firstRating.get(changes[i]['new_currency']).get(key) === undefined) {
                  firstRating.get(changes[i]['new_currency']).set(key, 1/(changes[i]['exchange_rate'] / value));
                }

                // console.log('secondDegree');
                // console.log(JSON.stringify(item.secondDegree));
              }
              // item.secondDegree = item.secondDegree;
            });

            chain.push(item);
            lastItem = item;
          }


          chain = chain.sort((a, b) => {
            return a.date < b.date ? 1 : -1;
          });

          resolve(chain);
        }
      }

    }; // end connectDB.onsuccess
    connectDB.onerror = function(event) {
      console.error(event);
    };

  });
}
