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
import moment from 'moment';

var firstRating = new Map();
var cachedChain = null;

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

      cachedChain = null;
      // API return 400 if catery = null
      if (!action.transaction.category) { delete action.transaction.category; }

      action.transaction.date = moment(action.transaction.date).format('YYYY-MM-DD');

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
        const year = response.data.date.slice(0,4);
        const month = response.data.date.slice(5,7);
        const day = response.data.date.slice(8,10);
        response.data.date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

        getChangeChain(response.data.account).then((chain) => {
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
        });
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
        } else if (action.dateBegin && action.dateEnd) {
          index = event.target.result
                      .transaction('transactions')
                      .objectStore('transactions')
                      .index('date');
          keyRange = IDBKeyRange.bound(action.dateBegin, action.dateEnd);
        } else {
          return;
        }

        // Request transactions based on criteria
        let cursor = index.openCursor(keyRange);
        cursor.onsuccess = function(event) {
          var cursor = event.target.result;

          if (cursor) {
            if (cursor.value.account === action.account) {
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
            }
            cursor.continue();
          } else {

            let generateChain

            if (transactions.length === 0) {

              generateChain = Promise.resolve(transactions);

            } else {

              let promises = [];
              let counter = 0;

              generateChain = new Promise((resolve, reject) => {
                getChangeChain(action.account).then((chain) => {
                  transactions.forEach((transaction) => {
                    promises.push(convertTo(transaction, action.currency, action.account));
                    counter++;
                    // If last transaction to convert we send nessage back.
                    if (counter === transactions.length) {

                      Promise.all(promises).then(() => {
                        resolve(transactions);
                      });
                    }
                  });
                });
              });
            }

            generateChain.then((transactions) => {

              let expenses = 0, incomes = 0;
              let categories = {};
              let dates = {};

              transactions.forEach((transaction) => {

                // Calculate categories
                if (transaction.category && !categories[transaction.category]) {
                  categories[transaction.category] = {
                    expenses: 0,
                    incomes: 0
                  };
                }

                // Calculate per dates
                if (!dates[transaction.date.getFullYear()]) {
                  dates[transaction.date.getFullYear()] = {
                    expenses: 0,
                    incomes: 0,
                    months: {}
                  };
                }
                if (!dates[transaction.date.getFullYear()]
                      .months[transaction.date.getMonth()]) {

                  dates[transaction.date.getFullYear()].months[transaction.date.getMonth()] = {
                    expenses: 0,
                    incomes: 0,
                    days: {}
                  }
                }
                if (!dates[transaction.date.getFullYear()]
                      .months[transaction.date.getMonth()]
                      .days[transaction.date.getDate()]) {

                  dates[transaction.date.getFullYear()].months[transaction.date.getMonth()].days[transaction.date.getDate()] = {
                    expenses: 0,
                    incomes: 0
                  }
                }

                if (transaction.amount >= 0) {
                  incomes += transaction.amount;
                  dates[transaction.date.getFullYear()].incomes += transaction.amount;
                  dates[transaction.date.getFullYear()].months[transaction.date.getMonth()].incomes += transaction.amount;
                  dates[transaction.date.getFullYear()].months[transaction.date.getMonth()].days[transaction.date.getDate()].incomes += transaction.amount;
                  if (transaction.category) {
                    categories[transaction.category].incomes += transaction.amount;
                  }
                } else {
                  expenses += transaction.amount;
                  dates[transaction.date.getFullYear()].expenses += transaction.amount;
                  dates[transaction.date.getFullYear()].months[transaction.date.getMonth()].expenses += transaction.amount;
                  dates[transaction.date.getFullYear()].months[transaction.date.getMonth()].days[transaction.date.getDate()].expenses += transaction.amount;
                  if (transaction.category) {
                    categories[transaction.category].expenses += transaction.amount;
                  }
                }


              });

              postMessage({
                type: action.type,
                dateBegin: action.dateBegin,
                dateEnd: action.dateEnd,
                stats: {
                  incomes: incomes,
                  expenses: expenses,
                  perDates: dates,
                  perCategories: categories
                },
                transactions: transactions,
              });
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

      action.transaction.date = moment(action.transaction.date).format('YYYY-MM-DD');

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
        const year = response.data.date.slice(0,4);
        const month = response.data.date.slice(5,7);
        const day = response.data.date.slice(8,10);
        response.data.date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

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


// Duplicate in Change worker
function getChangeChain(accountId) {
  return new Promise((resolve, reject) => {
    var chain = [];
    var counter = 0;
    var lastItem = {};
    var changes = [];

    if (cachedChain) {
      resolve(cachedChain);
    } else {
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
                date: new Date(changes[i].date),
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
            cachedChain = chain;
            resolve(chain);
          }
        }

      }; // end connectDB.onsuccess
      connectDB.onerror = function(event) {
        console.error(event);
      };

    }

  });
}
