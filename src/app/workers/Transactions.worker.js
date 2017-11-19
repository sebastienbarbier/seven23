import {
  TRANSACTIONS_INIT_REQUEST,
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
  DB_NAME,
  DB_VERSION,
} from "../constants";

import axios from "axios";
import moment from "moment";

var firstRating = new Map();
var cachedChain = null;

onmessage = function(event) {
  // Action object is the on generated in action object
  const action = event.data;

  switch (action.type) {
    case TRANSACTIONS_CREATE_REQUEST:
      cachedChain = null;
      // API return 400 if catery = null
      if (!action.transaction.category) {
        delete action.transaction.category;
      }

      action.transaction.date = moment(action.transaction.date).format(
        "YYYY-MM-DD"
      );

      axios({
        url: action.url + "/api/v1/debitscredits",
        method: "POST",
        headers: {
          Authorization: "Token " + action.token,
        },
        data: action.transaction,
      })
        .then(response => {
          // Populate data for indexedb indexes
          const year = response.data.date.slice(0, 4);
          const month = response.data.date.slice(5, 7);
          const day = response.data.date.slice(8, 10);
          response.data.date = new Date(
            Date.UTC(year, month - 1, day, 0, 0, 0)
          );

          getChangeChain(response.data.account).then(chain => {
            // Connect to indexedDB
            let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
            connectDB.onsuccess = function(event) {
              var customerObjectStore = event.target.result
                .transaction("transactions", "readwrite")
                .objectStore("transactions");

              // Save new transaction
              var request = customerObjectStore.put(response.data);

              request.onsuccess = function(event) {
                let transaction = {
                  id: response.data.id,
                  user: response.data.user,
                  account: response.data.account,
                  name: response.data.name,
                  date: response.data.date,
                  originalAmount: response.data.local_amount,
                  originalCurrency: response.data.local_currency,
                  category: response.data.category,
                  // Calculated value
                  isConversionAccurate: true, // Define is exchange rate is exact or estimated
                  isConversionFromFuturChange: false, // If we used future change to make calculation
                  isSecondDegreeRate: false, // If we used future change to make calculation
                  amount: response.data.local_amount,
                  currency: response.data.local_currency,
                };
                convertTo(
                  transaction,
                  action.currency,
                  response.data.account
                ).then(() => {
                  postMessage({
                    type: action.type,
                    transaction: transaction,
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
        })
        .catch(exception => {
          postMessage({
            type: action.type,
            exception: exception.response ? exception.response.data : null,
          });
        });
      break;
    case TRANSACTIONS_READ_REQUEST:
      let promises = [];
      let res = {
        type: action.type,
        dateBegin: action.dateBegin,
        dateEnd: action.dateEnd,
      };

      // Retrieve data between dateBegin and dateEnd
      promises.push(
        processData(event, action).then(data => {
          res.stats = {
            incomes: data.incomes,
            expenses: data.expenses,
            perDates: data.perDates,
            perCategories: data.perCategories,
          };
          res.transactions = data.transactions;
        })
      );

      // If request currentYear, preform same request with this year
      if (action.includeCurrentYear) {
        processCurrentYear;
        promises.push(
          processCurrentYear(event, action).then(data => {
            res.currentYear = data;
          })
        );
      }

      if (action.includeTrend) {
        promises.push(
          processTrend(event, action, 30).then(data => {
            res.trend = data;
          })
        );
      }

      Promise.all(promises).then(() => {
        postMessage(res);
      });

      break;
    case TRANSACTIONS_UPDATE_REQUEST:
      // API return 400 if catery = null
      if (!action.transaction.category) {
        delete action.transaction.category;
      }

      action.transaction.date = moment(action.transaction.date).format(
        "YYYY-MM-DD"
      );

      axios({
        url: action.url + "/api/v1/debitscredits/" + action.transaction.id,
        method: "PUT",
        headers: {
          Authorization: "Token " + action.token,
        },
        data: action.transaction,
      })
        .then(response => {
          // Populate data for indexedb indexes
          const year = response.data.date.slice(0, 4);
          const month = response.data.date.slice(5, 7);
          const day = response.data.date.slice(8, 10);
          response.data.date = new Date(
            Date.UTC(year, month - 1, day, 0, 0, 0)
          );

          // Connect to indexedDB
          let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
          connectDB.onsuccess = function(event) {
            var customerObjectStore = event.target.result
              .transaction("transactions", "readwrite")
              .objectStore("transactions");

            // Save new transaction
            var request = customerObjectStore.put(response.data);

            request.onsuccess = function(event) {
              let transaction = {
                id: response.data.id,
                user: response.data.user,
                account: response.data.account,
                name: response.data.name,
                date: response.data.date,
                originalAmount: response.data.local_amount,
                originalCurrency: response.data.local_currency,
                category: response.data.category,
                // Calculated value
                isConversionAccurate: true, // Define is exchange rate is exact or estimated
                isConversionFromFuturChange: false, // If we used future change to make calculation
                isSecondDegreeRate: false, // If we used future change to make calculation
                amount: response.data.local_amount,
                currency: response.data.local_currency,
              };

              convertTo(
                transaction,
                action.currency,
                action.transaction.account
              ).then(() => {
                postMessage({
                  type: action.type,
                  transaction: transaction,
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
        })
        .catch(exception => {
          postMessage({
            type: action.type,
            exception: exception.response ? exception.response.data : null,
          });
        });
      break;
    case TRANSACTIONS_DELETE_REQUEST:
      axios({
        url: action.url + "/api/v1/debitscredits/" + action.transaction.id,
        method: "DELETE",
        headers: {
          Authorization: "Token " + action.token,
        },
      })
        .then(response => {
          // Connect to indexedDB
          let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
          connectDB.onsuccess = function(event) {
            var customerObjectStore = event.target.result
              .transaction("transactions", "readwrite")
              .objectStore("transactions");

            // Save new transaction
            var request = customerObjectStore.delete(action.transaction.id);

            request.onsuccess = function(event) {
              postMessage({
                type: action.type,
                transaction: {
                  id: action.transaction.id,
                },
              });
            };
            request.onerror = function(event) {
              console.error(event);
            };
          };
        })
        .catch(exception => {
          postMessage({
            type: action.type,
            exception: exception.response ? exception.response.data : null,
          });
        });
      break;

    default:
      return;
  }
};

// Return list of transactions
function retrieveTransactionsPerCategory(category, account, currency) {
  return retrieveTransactions(
    {
      category: category,
    },
    account,
    currency
  );
}

// Return list of transactions
function retrieveTransactionsPerDate(dateBegin, dateEnd, account, currency) {
  return retrieveTransactions(
    {
      dateBegin: dateBegin,
      dateEnd: dateEnd,
    },
    account,
    currency
  );
}

// Connect to IndexedDB to retrieve a list of transaction for account and converted in currency
function retrieveTransactions(object, account, currency) {
  let transactions = []; // Set object of Transaction

  return new Promise((resolve, reject) => {
    let connectDB = indexedDB.open(DB_NAME, DB_VERSION);

    connectDB.onsuccess = function(event) {
      let cursor = null;
      if (object.category) {
        cursor = event.target.result
          .transaction("transactions")
          .objectStore("transactions")
          .index("category")
          .openCursor(IDBKeyRange.only([account, parseInt(object.category)]));
      } else if (object.dateBegin && object.dateEnd) {
        cursor = event.target.result
          .transaction("transactions")
          .objectStore("transactions")
          .index("date")
          .openCursor(IDBKeyRange.bound(object.dateBegin, object.dateEnd));
      }

      cursor.onsuccess = function(event) {
        var cursor = event.target.result;
        // If cursor.continue() still have data to parse.
        if (cursor) {
          if (cursor.value.account === account) {
            transactions.push({
              id: cursor.value.id,
              user: cursor.value.user,
              account: cursor.value.account,
              name: cursor.value.name,
              date: cursor.value.date,
              originalAmount: cursor.value.local_amount,
              originalCurrency: cursor.value.local_currency,
              category: cursor.value.category,
              // Calculated value
              isConversionAccurate: true, // Define is exchange rate is exact or estimated
              isConversionFromFuturChange: false, // If we used future change to make calculation
              isSecondDegreeRate: false, // If we used future change to make calculation
              amount: cursor.value.local_amount,
              currency: cursor.value.local_currency,
            });
          }
          cursor.continue();
        } else {
          /* At this point, we have a list of transaction.
             We need to convert to currency in params */
          if (transactions.length === 0) return resolve(transactions);

          let promises = [];
          let counter = 0;

          getChangeChain(account).then(chain => {
            transactions.forEach(transaction => {
              promises.push(convertTo(transaction, currency, account));
              counter++;
              // If last transaction to convert we send nessage back.
              if (counter === transactions.length) {
                Promise.all(promises).then(() => {
                  resolve(transactions);
                });
              }
            });
          });
        }
      };
      cursor.onerror = function(event) {
        reject(event);
      };
    };
    connectDB.onerror = function(event) {
      reject(event);
    };
  });
}

function processData(event, action) {
  return new Promise((resolve, reject) => {
    let promise;

    if (action.category) {
      promise = retrieveTransactionsPerCategory(
        action.category,
        action.account,
        action.currency
      );
    } else if (action.dateBegin && action.dateEnd) {
      promise = retrieveTransactionsPerDate(
        action.dateBegin,
        action.dateEnd,
        action.account,
        action.currency
      );
    } else {
      reject("Missing criteria");
    }

    promise.then(transactions => {
      let expenses = 0,
        incomes = 0;
      let categories = {};
      let dates = {};

      // For each transaction
      transactions.forEach(transaction => {
        // Calculate categories
        if (transaction.category && !categories[transaction.category]) {
          categories[transaction.category] = {
            expenses: 0,
            incomes: 0,
          };
        }

        // Calculate per dates
        if (!dates[transaction.date.getFullYear()]) {
          dates[transaction.date.getFullYear()] = {
            expenses: 0,
            incomes: 0,
            months: {},
          };
        }
        if (
          !dates[transaction.date.getFullYear()].months[
            transaction.date.getMonth()
          ]
        ) {
          dates[transaction.date.getFullYear()].months[
            transaction.date.getMonth()
          ] = {
            expenses: 0,
            incomes: 0,
            days: {},
          };
        }
        if (
          !dates[transaction.date.getFullYear()].months[
            transaction.date.getMonth()
          ].days[transaction.date.getDate()]
        ) {
          dates[transaction.date.getFullYear()].months[
            transaction.date.getMonth()
          ].days[transaction.date.getDate()] = {
            expenses: 0,
            incomes: 0,
          };
        }

        if (transaction.amount >= 0) {
          incomes += transaction.amount;
          dates[transaction.date.getFullYear()].incomes += transaction.amount;
          dates[transaction.date.getFullYear()].months[
            transaction.date.getMonth()
          ].incomes +=
            transaction.amount;
          dates[transaction.date.getFullYear()].months[
            transaction.date.getMonth()
          ].days[transaction.date.getDate()].incomes +=
            transaction.amount;
          if (transaction.category) {
            categories[transaction.category].incomes += transaction.amount;
          }
        } else {
          expenses += transaction.amount;
          dates[transaction.date.getFullYear()].expenses += transaction.amount;
          dates[transaction.date.getFullYear()].months[
            transaction.date.getMonth()
          ].expenses +=
            transaction.amount;
          dates[transaction.date.getFullYear()].months[
            transaction.date.getMonth()
          ].days[transaction.date.getDate()].expenses +=
            transaction.amount;
          if (transaction.category) {
            categories[transaction.category].expenses += transaction.amount;
          }
        }
      });

      resolve({
        incomes: incomes,
        expenses: expenses,
        perDates: dates,
        perCategories: categories,
        transactions: transactions,
      });
    });
  });
}

function processCurrentYear(event, action) {
  return new Promise((resolve, reject) => {
    const now = moment().utc();

    retrieveTransactionsPerDate(
      moment()
        .utc()
        .startOf("year")
        .toDate(),
      moment()
        .utc()
        .endOf("year")
        .toDate(),
      action.account,
      action.currency
    ).then(transactions => {
      let result = {
        incomes: 0,
        expenses: 0,
        currentMonth: {
          incomes: 0,
          expenses: 0,
        },
      };
      transactions.forEach(transaction => {
        if (transaction.amount >= 0) {
          result.incomes += transaction.amount;
          if (now.month() === transaction.date.getMonth()) {
            result.currentMonth.incomes += transaction.amount;
          }
        } else {
          result.expenses += transaction.amount;
          if (now.month() === transaction.date.getMonth()) {
            result.currentMonth.expenses += transaction.amount;
          }
        }
      });
      resolve(result);
    });
  });
}

function processTrend(event, action, numberOfDayToAnalyse) {
  return new Promise((resolve, reject) => {
    let promises = [];
    let categories = {};

    // Earliest range
    promises.push(
      retrieveTransactionsPerDate(
        moment()
          .utc()
          .subtract(numberOfDayToAnalyse + 1, "days")
          .startOf("day")
          .toDate(),
        moment()
          .utc()
          .subtract(1, "days")
          .endOf("day")
          .toDate(),
        action.account,
        action.currency
      ).then(transactions => {
        transactions.forEach(transaction => {
          if (transaction.category) {
            if (!categories[+transaction.category]) {
              categories[+transaction.category] = {
                earliest: 0,
                oldiest: 0,
              };
            }
            if (transaction.amount <= 0) {
              categories[+transaction.category].earliest =
                categories[+transaction.category].earliest + transaction.amount;
            }
          }
        });
      })
    );

    // Oldiest range
    promises.push(
      retrieveTransactionsPerDate(
        moment()
          .utc()
          .subtract(numberOfDayToAnalyse * 2 + 2, "days")
          .startOf("day")
          .toDate(),
        moment()
          .utc()
          .subtract(numberOfDayToAnalyse + 2, "days")
          .endOf("day")
          .toDate(),
        action.account,
        action.currency
      ).then(transactions => {
        transactions.forEach(transaction => {
          if (transaction.category) {
            if (!categories[+transaction.category]) {
              categories[+transaction.category] = {
                earliest: 0,
                oldiest: 0,
              };
            }
            if (transaction.amount < 0) {
              categories[+transaction.category].oldiest =
                categories[+transaction.category].oldiest + transaction.amount;
            }
          }
        });
      })
    );

    Promise.all(promises).then(() => {
      let trend = [];
      Object.keys(categories).forEach(key => {
        trend.push({
          id: key,
          diff: categories[key].earliest / categories[key].oldiest,
          earliest: categories[key].earliest,
          oldiest: categories[key].oldiest,
        });
      });
      resolve(
        trend.sort((a, b) => {
          if (a.oldiest == 0 && b.oldiest == 0) return a.earliest > b.earliest;
          if (a.oldiest == 0) return -1;
          if (b.oldiest == 0) return 1;
          if (a.earliest == 0 && b.earliest == 0) return a.oldiest < b.oldiest;
          return a.diff < b.diff ? 1 : -1;
        })
      );
    });
  });
}

// Convert a transation to a specific currencyId
function convertTo(transaction, currencyId, accountId) {
  return new Promise((resolve, reject) => {
    try {
      if (currencyId === transaction.originalCurrency) {
        transaction.isConversionAccurate = true;
        transaction.amount = transaction.originalAmount;
        resolve();
      } else {
        getChangeChain(accountId)
          .then(chain => {
            const result = chain.find(item => {
              return item.date <= transaction.date;
            });

            transaction.currency = currencyId;
            transaction.isConversionAccurate = false;
            transaction.isConversionFromFuturChange = false;
            transaction.isSecondDegreeRate = false;
            if (result) {
              var change = result;
              // If exchange rate exist, we calculate exact change rate
              if (
                change.rates.has(transaction.originalCurrency) &&
                change.rates.get(transaction.originalCurrency).has(currencyId)
              ) {
                transaction.isConversionAccurate = true;
                transaction.amount =
                  transaction.originalAmount *
                  change.rates
                    .get(transaction.originalCurrency)
                    .get(currencyId);
              } else {
                // We take first Rating is available
                if (
                  change.secondDegree.has(transaction.originalCurrency) &&
                  change.secondDegree
                    .get(transaction.originalCurrency)
                    .has(currencyId)
                ) {
                  transaction.isSecondDegreeRate = true;
                  transaction.amount =
                    transaction.originalAmount *
                    change.secondDegree
                      .get(transaction.originalCurrency)
                      .get(currencyId);
                } else {
                  // We take secondDegree transaction if possible
                  if (
                    firstRating.has(transaction.originalCurrency) &&
                    firstRating
                      .get(transaction.originalCurrency)
                      .has(currencyId)
                  ) {
                    transaction.isConversionFromFuturChange = true;
                    transaction.amount =
                      transaction.originalAmount *
                      firstRating
                        .get(transaction.originalCurrency)
                        .get(currencyId);
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
          .catch(exception => {
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
          .transaction("changes")
          .objectStore("changes")
          .index("account");

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
              if (item.rates.get(changes[i]["local_currency"]) === undefined) {
                firstRating.set(changes[i]["local_currency"], new Map());
              }
              if (
                firstRating
                  .get(changes[i]["local_currency"])
                  .get(changes[i]["new_currency"]) === undefined
              ) {
                firstRating
                  .get(changes[i]["local_currency"])
                  .set(changes[i]["new_currency"], changes[i]["exchange_rate"]);
              }

              // If first time using this new Currency
              if (item.rates.get(changes[i]["new_currency"]) === undefined) {
                firstRating.set(changes[i]["new_currency"], new Map());
              }
              if (
                firstRating
                  .get(changes[i]["new_currency"])
                  .get(changes[i]["local_currency"]) === undefined
              ) {
                firstRating
                  .get(changes[i]["new_currency"])
                  .set(
                    changes[i]["local_currency"],
                    1 / changes[i]["exchange_rate"]
                  );
              }

              // GENERERATE CHAIN ITEM
              item.rates.set(
                changes[i]["local_currency"],
                new Map(item.rates.get(changes[i]["local_currency"]))
              );
              item.rates
                .get(changes[i]["local_currency"])
                .set(changes[i]["new_currency"], changes[i]["exchange_rate"]);

              item.rates.set(
                changes[i]["new_currency"],
                new Map(item.rates.get(changes[i]["new_currency"]))
              );
              item.rates
                .get(changes[i]["new_currency"])
                .set(
                  changes[i]["local_currency"],
                  1 / changes[i]["exchange_rate"]
                );

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
              item.rates
                .get(changes[i]["local_currency"])
                .forEach((value, key) => {
                  if (key !== changes[i]["new_currency"]) {
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
                    item.secondDegree
                      .get(key)
                      .set(
                        changes[i]["new_currency"],
                        changes[i]["exchange_rate"] / value
                      );

                    if (
                      item.secondDegree.get(changes[i]["new_currency"]) ===
                      undefined
                    ) {
                      item.secondDegree.set(
                        changes[i]["new_currency"],
                        new Map()
                      );
                    }
                    item.secondDegree
                      .get(changes[i]["new_currency"])
                      .set(key, 1 / (changes[i]["exchange_rate"] / value));

                    // We also need to update firstRate with this new value ... sad :(
                    if (firstRating.get(key) === undefined) {
                      firstRating.set(key, new Map());
                    }
                    if (
                      firstRating.get(key).get(changes[i]["new_currency"]) ===
                      undefined
                    ) {
                      firstRating
                        .get(key)
                        .set(
                          changes[i]["new_currency"],
                          changes[i]["exchange_rate"] / value
                        );
                    }

                    if (
                      firstRating.get(changes[i]["new_currency"]) === undefined
                    ) {
                      firstRating.set(changes[i]["new_currency"], new Map());
                    }
                    if (
                      firstRating.get(changes[i]["new_currency"]).get(key) ===
                      undefined
                    ) {
                      firstRating
                        .get(changes[i]["new_currency"])
                        .set(key, 1 / (changes[i]["exchange_rate"] / value));
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
        };
      }; // end connectDB.onsuccess
      connectDB.onerror = function(event) {
        console.error(event);
      };
    }
  });
}
