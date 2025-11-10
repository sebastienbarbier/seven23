import {
  ENCRYPTION_ERROR,
  ENCRYPTION_KEY_CHANGED,
  FLUSH,
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_EXPORT,
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_SYNC_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
} from "../constants";

import axios from "axios";
import encryption from "../encryption";
import storage from "../storage";

import { firstRating, getChangeChain } from "../utils/change";
import { dateToString, stringToDate } from "../utils/date";
import { generateRecurrences } from "../utils/transaction";

var cachedChain = null;
var last_edited = null;

onmessage = function (event) {
  // Action object is the on generated in action object
  const action = event.data;
  const { uuid } = action;

  switch (action.type) {
    case TRANSACTIONS_SYNC_REQUEST: {
      encryption.key(action.cipher).then(() => {
        let transactions = action.transactions;

        // Load transactions store
        storage.connectIndexedDB().then((connection) => {
          var customerObjectStore = connection
            .transaction("transactions", "readwrite")
            .objectStore("transactions");

          let minDate = dateToString(new Date());
          let maxDate = dateToString(new Date());

          const addObject = (i) => {
            var obj = i.next();

            if (obj && obj.value) {
              obj = obj.value[1];

              if (obj.deleted) {
                if (!last_edited || obj.last_edited > last_edited) {
                  last_edited = obj.last_edited;
                }

                var request = customerObjectStore.delete(obj.id);
                request.onsuccess = function (event) {
                  addObject(i);
                };
                request.onerror = function (event) {
                  console.error(event);
                };
              } else {
                encryption
                  .decrypt(obj.blob === "" ? "{}" : obj.blob)
                  .then((json) => {
                    obj = Object.assign({}, obj, json);
                    delete obj.blob;

                    if (obj.amount) {
                      obj.local_amount = obj.amount;
                      delete obj.amount;
                    }

                    if (obj.date && obj.name) {
                      // Populate data for indexedb indexes
                      if (obj.date > maxDate) {
                        maxDate = obj.date;
                      }
                      if (obj.date < minDate) {
                        minDate = obj.date;
                      }

                      if (!obj.category) {
                        delete obj.category;
                      }

                      // Update lat_edited to keep track of latest updated record
                      if (!last_edited || obj.last_edited > last_edited) {
                        last_edited = obj.last_edited;
                      }

                      const saveObject = (obj) => {
                        var request = customerObjectStore.put(obj);
                        request.onsuccess = function (event) {
                          addObject(i);
                        };
                        request.onerror = function (event) {
                          console.error(event);
                        };
                      };

                      // If data were enrypted, Jose.JWT cut indexedebd connection so we need
                      // to catch that case and reconnect to continue storing our data.
                      try {
                        saveObject(obj);
                      } catch (exception) {
                        if (exception instanceof DOMException) {
                          customerObjectStore = connection
                            .transaction("transactions", "readwrite")
                            .objectStore("transactions");
                          saveObject(obj);
                        } else {
                          console.error(exception);
                        }
                      }
                    } else {
                      addObject(i);
                    }
                  })
                  .catch((exception) => {
                    console.error(exception);
                    postMessage({
                      uuid,
                      type: ENCRYPTION_ERROR,
                    });
                  });
              }
            } else {
              postMessage({
                uuid,
                type: TRANSACTIONS_SYNC_REQUEST,
                last_edited,
              });
            }
          };

          addObject(transactions.entries());
        });
      });
      break;
    }
    case TRANSACTIONS_CREATE_REQUEST: {
      let response_transaction = action.transaction;

      storage.connectIndexedDB().then((connection) => {
        var customerObjectStore = connection
          .transaction("transactions", "readwrite")
          .objectStore("transactions");

        // Save new transaction
        var request = customerObjectStore.put(response_transaction);

        request.onsuccess = function (event) {
          const transaction = {
            id: response_transaction.id,
            account: response_transaction.account,
            name: response_transaction.name,
            date: response_transaction.date,
            originalAmount: response_transaction.local_amount,
            originalCurrency: response_transaction.local_currency,
            originalPending: response_transaction.isPending,
            category: response_transaction.category,
            // Calculated value
            isConversionAccurate: true, // Define is exchange rate is exact or estimated
            isConversionFromFuturChange: false, // If we used future change to make calculation
            isSecondDegreeRate: false, // If we used future change to make calculation
            amount: response_transaction.local_amount,
            currency: response_transaction.local_currency,
            frequency: response_transaction.frequency,
            duration: response_transaction.duration,
            isPending: response_transaction.isPending,
            adjustments: response_transaction.adjustments,
            notes: response_transaction.notes,
          };

          convertTo(
            generateRecurrences(transaction),
            action.currency,
            transaction.account
          ).then((transactions) => {
            postMessage({
              uuid,
              type: action.type,
              transactions: transactions,
            });
          });
        };
        request.onerror = function (event) {
          console.error(event);
        };
      });

      break;
    }
    case TRANSACTIONS_READ_REQUEST: {
      cachedChain = null;

      // If action.id, user will receive a unique transaction
      if (action.id) {
        retrieveTransaction(action.id)
          .then((transaction) => {
            postMessage({
              uuid,
              type: TRANSACTIONS_READ_REQUEST,
              transaction,
            });
          })
          .catch((e) => {
            console.error(e);
          });
      } else {
        retrieveTransactions(
          action.account,
          action.currency,
          action.transactions
        )
          .then((result) => {
            const { transactions, youngest, oldest, transactionWithNoAmount } =
              result;
            postMessage({
              uuid,
              type: TRANSACTIONS_READ_REQUEST,
              transactions,
              youngest,
              oldest,
              transactionWithNoAmount,
            });
          })
          .catch((e) => {
            console.error(e);
          });
      }

      break;
    }
    case TRANSACTIONS_EXPORT: {
      exportTransactions(action.account)
        .then((transactions) => {
          postMessage({
            uuid,
            type: TRANSACTIONS_EXPORT,
            transactions,
          });
        })
        .catch((exception) => {
          postMessage({
            uuid,
            type: TRANSACTIONS_EXPORT,
            exception,
          });
        });

      break;
    }
    case TRANSACTIONS_UPDATE_REQUEST: {
      let response_transaction = action.transaction;

      storage.connectIndexedDB().then((connection) => {
        var customerObjectStore = connection
          .transaction("transactions", "readwrite")
          .objectStore("transactions");

        // Save new transaction
        var request = customerObjectStore.put(response_transaction);

        request.onsuccess = function (event) {
          const transaction = {
            id: response_transaction.id,
            account: response_transaction.account,
            name: response_transaction.name,
            date: response_transaction.date,
            originalAmount: response_transaction.local_amount,
            originalCurrency: response_transaction.local_currency,
            originalPending: response_transaction.isPending,
            category: response_transaction.category,
            // Calculated value
            isConversionAccurate: true, // Define is exchange rate is exact or estimated
            isConversionFromFuturChange: false, // If we used future change to make calculation
            isSecondDegreeRate: false, // If we used future change to make calculation
            amount: response_transaction.local_amount,
            currency: response_transaction.local_currency,
            frequency: response_transaction.frequency,
            duration: response_transaction.duration,
            isPending: response_transaction.isPending,
            adjustments: response_transaction.adjustments,
            notes: response_transaction.notes,
          };
          convertTo(
            generateRecurrences(transaction),
            action.currency,
            transaction.account
          ).then((transactions) => {
            postMessage({
              uuid,
              type: action.type,
              transactions: transactions,
            });
          });
        };
        request.onerror = function (event) {
          console.error(event);
        };
      });

      break;
    }

    case FLUSH: {
      const { accounts } = action;
      if (accounts) {
        if (accounts.length == 0) {
          postMessage({
            uuid,
          });
        } else {
          // For each account, we select all transaction, and delete them one by one.
          accounts.forEach((account) => {
            storage.connectIndexedDB().then((connection) => {
              var customerObjectStore = connection
                .transaction("transactions", "readwrite")
                .objectStore("transactions")
                .index("account")
                .openCursor(IDBKeyRange.only(account));

              customerObjectStore.onsuccess = function (event) {
                var cursor = event.target.result;
                // If cursor.continue() still have data to parse.
                if (cursor) {
                  cursor.delete();
                  cursor.continue();
                } else {
                  postMessage({
                    uuid,
                  });
                }
              };
            });
          });
        }
      } else {
        storage.connectIndexedDB().then((connection) => {
          var customerObjectStore = connection
            .transaction("transactions", "readwrite")
            .objectStore("transactions");

          customerObjectStore.clear().onsuccess = (event) => {
            postMessage({
              uuid,
            });
          };
        });
      }

      break;
    }
    case ENCRYPTION_KEY_CHANGED: {
      const { url, token, newCipher, oldCipher } = action;

      axios({
        url: url + "/api/v1/debitscredits",
        method: "get",
        headers: {
          Authorization: "Token " + token,
        },
      })
        .then(function (response) {
          let promises = [];
          const transactions = [];

          encryption.key(oldCipher).then(() => {
            response.data.forEach((transaction) => {
              promises.push(
                new Promise((resolve, reject) => {
                  encryption
                    .decrypt(transaction.blob === "" ? "{}" : transaction.blob)
                    .then((json) => {
                      delete transaction.blob;
                      transactions.push({
                        id: transaction.id,
                        blob: json,
                      });
                      resolve();
                    });
                })
              );
            });

            Promise.all(promises)
              .then(() => {
                promises = [];
                encryption.key(newCipher).then(() => {
                  transactions.forEach((transaction) => {
                    promises.push(
                      new Promise((resolve, reject) => {
                        encryption
                          .encrypt(
                            transaction.blob === "" ? "{}" : transaction.blob
                          )
                          .then((json) => {
                            transaction.blob = json;
                            resolve();
                          });
                      })
                    );
                  });

                  Promise.all(promises)
                    .then((_) => {
                      axios({
                        url: url + "/api/v1/debitscredits",
                        method: "PATCH",
                        headers: {
                          Authorization: "Token " + token,
                        },
                        data: transactions,
                      })
                        .then((response) => {
                          postMessage({
                            uuid,
                            type: action.type,
                          });
                        })
                        .catch((exception) => {
                          postMessage({
                            uuid,
                            type: action.type,
                            exception,
                          });
                        });
                    })
                    .catch((exception) => {
                      postMessage({
                        uuid,
                        type: action.type,
                        exception,
                      });
                    });
                });
              })
              .catch((exception) => {
                postMessage({
                  uuid,
                  type: action.type,
                  exception,
                });
              });
          });
        })
        .catch((exception) => {
          postMessage({
            uuid,
            type: action.type,
            exception,
          });
        });
      break;
    }
    default:
      return;
  }
};

function retrieveTransaction(id) {
  return new Promise((resolve, reject) => {
    storage.connectIndexedDB().then((connection) => {
      var objectStoreRequest = connection
        .transaction("transactions")
        .objectStore("transactions")
        .get(id);
      objectStoreRequest.onsuccess = function (event) {
        var transaction = objectStoreRequest.result;
        resolve({
          id: transaction.id,
          account: transaction.account,
          name: transaction.name,
          date: dateToString(transaction.date),
          originalAmount: transaction.local_amount,
          originalCurrency: transaction.local_currency,
          originalPending: transaction.isPending,
          category: transaction.category,
          // Calculated value
          isConversionAccurate: true, // Define is exchange rate is exact or estimated
          isConversionFromFuturChange: false, // If we used future change to make calculation
          isSecondDegreeRate: false, // If we used future change to make calculation
          amount: transaction.local_amount,
          currency: transaction.local_currency,
          frequency: transaction.frequency,
          duration: transaction.duration,
          isPending: transaction.isPending,
          adjustments: transaction.adjustments,
          notes: transaction.notes,
        });
      };

      objectStoreRequest.onerror = function (event) {
        reject(event);
      };
    });
  });
}

// Connect to IndexedDB to retrieve a list of transaction for account and converted in currency
function retrieveTransactions(account, currency, transactions = null) {
  return new Promise((resolve, reject) => {
    let promise;
    if (transactions) {
      promise = Promise.resolve(transactions);
    } else if (!account) {
      promise = Promise.resolve([]);
    } else {
      promise = new Promise((resolve, reject) => {
        let transactions = []; // Set object of Transaction

        storage.connectIndexedDB().then((connection) => {
          let cursor = connection
            .transaction("transactions")
            .objectStore("transactions")
            .index("account")
            .openCursor(IDBKeyRange.only(account));

          cursor.onsuccess = function (event) {
            var cursor = event.target.result;
            // If cursor.continue() still have data to parse.
            if (cursor) {
              if (cursor.value.account === account) {
                const transaction = {
                  id: cursor.value.id,
                  account: cursor.value.account,
                  name: cursor.value.name,
                  date: dateToString(cursor.value.date),
                  originalAmount: cursor.value.local_amount,
                  originalCurrency: cursor.value.local_currency,
                  originalPending: cursor.value.isPending,
                  category: cursor.value.category,
                  // Calculated value
                  isConversionAccurate: true, // Define is exchange rate is exact or estimated
                  isConversionFromFuturChange: false, // If we used future change to make calculation
                  isSecondDegreeRate: false, // If we used future change to make calculation
                  amount: cursor.value.local_amount,
                  currency: cursor.value.local_currency,
                  frequency: cursor.value.frequency,
                  duration: cursor.value.duration,
                  isPending: cursor.value.isPending,
                  adjustments: cursor.value.adjustments,
                  notes: cursor.value.notes,
                };
                transactions = [
                  ...transactions,
                  ...generateRecurrences(transaction),
                ];
              }
              cursor.continue();
            } else {
              resolve(transactions);
            }
          };
          cursor.onerror = function (event) {
            reject(event);
          };
        });
      });
    }

    promise
      .then((transactions) => {
        let youngest = new Date();
        let oldest = new Date();

        /* At this point, we have a list of transaction.
         We need to convert to currency in params */
        if (transactions.length === 0) {
          return resolve({ transactions, youngest, oldest });
        }

        let promises = [];
        let counter = 0;

        getCachedChangeChain(account).then((chain) => {
          transactions.forEach((transaction) => {
            transaction.date = stringToDate(transaction.date);
            if (transaction.date < youngest) {
              youngest = transaction.date;
            } else if (transaction.date > oldest) {
              oldest = transaction.date;
            }
            promises.push(convertTo([transaction], currency, account));
            counter++;
            // If last transaction to convert we send nessage back.
            if (counter === transactions.length) {
              Promise.all(promises).then((transactions) => {
                const list = transactions.flat();

                // Parse all transactions and look for some with no change value.
                const transactionWithNoAmount = list.filter((transaction) => {
                  return Boolean(transaction["amount"] == null);
                });

                resolve({
                  transactions: list,
                  youngest,
                  oldest,
                  transactionWithNoAmount,
                });
              });
            }
          });
        });
      })
      .catch((exception) => {
        reject(exception);
      });
  });
}

// Convert a transation to a specific currencyId
function convertTo(transactions, currencyId, accountId) {
  return new Promise((resolve, reject) => {
    try {
      const promises = [];
      transactions.forEach((transaction) => {
        promises.push(
          new Promise((resolve, reject) => {
            if (currencyId === transaction.originalCurrency) {
              transaction.isConversionAccurate = true;
              transaction.amount = transaction.originalAmount;
              resolve(transaction);
            } else {
              // chain is a list of all change object, with rates and secondDegree value in it to know
              // which exchange rate to use.
              getCachedChangeChain(accountId)
                .then((chain) => {
                  // We look for the Change object before our transaction date.
                  // chain is order by date, we sop at the first one
                  const result = chain.find((item) => {
                    // use dateToString(item.date) to keep retro compatibility (2020-09-14)
                    return (
                      dateToString(item.date) <= dateToString(transaction.date)
                    );
                  });

                  // We provide default value for metadata regarding the transaction
                  transaction.amount = null; // Amount is null
                  transaction.currency = currencyId;
                  transaction.isConversionAccurate = false;
                  transaction.isConversionFromFuturChange = false;
                  transaction.isSecondDegreeRate = false;

                  // If there is a change before transaction, we use it.
                  var change = result;

                  // If exchange rate exist, we calculate exact change rate
                  if (
                    change &&
                    change.rates[transaction.originalCurrency] &&
                    change.rates[transaction.originalCurrency][currencyId]
                  ) {
                    transaction.isConversionAccurate = true;
                    transaction.amount =
                      transaction.originalAmount *
                      change.rates[transaction.originalCurrency][currencyId];
                  }

                  // There is no exact value, we look for a second Degree which is very approximative
                  if (
                    change &&
                    transaction.amount == null &&
                    change.secondDegree[transaction.originalCurrency] &&
                    change.secondDegree[transaction.originalCurrency][
                      currencyId
                    ]
                  ) {
                    transaction.isSecondDegreeRate = true;
                    transaction.amount =
                      transaction.originalAmount *
                      change.secondDegree[transaction.originalCurrency][
                        currencyId
                      ];
                  }

                  // Here is no change before our transaction. We will then look for a future Change by taking
                  // the default value within firstRating object.
                  if (
                    transaction.amount == null &&
                    firstRating[transaction.originalCurrency] &&
                    firstRating[transaction.originalCurrency][currencyId]
                  ) {
                    transaction.isConversionFromFuturChange = true;
                    transaction.amount =
                      transaction.originalAmount *
                      firstRating[transaction.originalCurrency][currencyId];
                  }

                  // There is no transaction, and no future Change to use.
                  // We probably don't know that currency, and should return amount null
                  // A Warning will be displayed, user need to provide an exchange rate.
                  resolve(transaction);
                })
                .catch((exception) => {
                  console.error(exception);
                  reject(exception);
                });
            }
          })
        );
      });
      Promise.all(promises)
        .then((transactions) => {
          resolve(transactions.flat());
        })
        .catch((exception) => {
          console.error(exception);
          reject(exception);
        });
    } catch (exception) {
      console.error(exception);
      reject(exception);
    }
  });
}

// Duplicate in Change worker
function getCachedChangeChain(accountId) {
  return new Promise((resolve, reject) => {
    if (cachedChain) {
      resolve(cachedChain);
    } else {
      getChangeChain(accountId).then((chain) => {
        cachedChain = chain;
        resolve(chain);
      });
    }
  });
}

function exportTransactions(account) {
  let transactions = []; // Set object of Transaction

  return new Promise((resolve, reject) => {
    storage.connectIndexedDB().then((connection) => {
      let cursor = connection
        .transaction("transactions")
        .objectStore("transactions")
        .index("account")
        .openCursor(IDBKeyRange.only(account));

      cursor.onsuccess = function (event) {
        var cursor = event.target.result;
        // If cursor.continue() still have data to parse.
        if (cursor) {
          if (cursor.value.account === account) {
            transactions.push({
              id: cursor.value.id,
              name: cursor.value.name,
              date: cursor.value.date,
              local_amount: cursor.value.local_amount,
              local_currency: cursor.value.local_currency,
              category: cursor.value.category || undefined,
              frequency: cursor.value.frequency,
              duration: cursor.value.duration,
              isPending: cursor.value.isPending,
              adjustments: cursor.value.adjustments,
              notes: cursor.value.notes,
            });
          }
          cursor.continue();
        } else {
          resolve(transactions);
        }
      };
      cursor.onerror = function (event) {
        reject(event);
      };
    });
  });
}
