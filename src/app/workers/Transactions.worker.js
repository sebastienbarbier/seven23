import {
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
  TRANSACTIONS_SYNC_REQUEST,
  TRANSACTIONS_EXPORT,
  UPDATE_ENCRYPTION,
  ENCRYPTION_KEY_CHANGED,
  ENCRYPTION_ERROR,
  DB_NAME,
  DB_VERSION,
  FLUSH
} from "../constants";

import axios from "axios";
import storage from "../storage";
import encryption from "../encryption";

import { firstRating, getChangeChain } from "./utils/changeChain";

var cachedChain = null;
var last_edited = null;

function generateBlob(transaction) {
  const blob = {};

  blob.name = transaction.name;
  const date = transaction.date;
  blob.date = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(
    -2
  )}-${("0" + date.getDate()).slice(-2)}`;
  blob.local_amount = transaction.local_amount;
  blob.local_currency = transaction.local_currency;

  return blob;
}

onmessage = function(event) {
  // Action object is the on generated in action object
  const action = event.data;

  switch (action.type) {
    case TRANSACTIONS_SYNC_REQUEST: {
      encryption.key(action.cipher).then(() => {
        let transactions = action.transactions;

        // Load transactions store
        storage.connectIndexedDB().then(connection => {
          var customerObjectStore = connection
            .transaction("transactions", "readwrite")
            .objectStore("transactions");
          // Delete all previous objects
          //
          if (!action.last_edited) {
            customerObjectStore.clear();
          }

          let minDate = new Date();
          let maxDate = new Date();

          const addObject = i => {
            var obj = i.next();

            if (obj && obj.value) {
              obj = obj.value[1];

              if (obj.deleted) {
                if (!last_edited || obj.last_edited > last_edited) {
                  last_edited = obj.last_edited;
                }

                var request = customerObjectStore.delete(obj.id);
                request.onsuccess = function(event) {
                  addObject(i);
                };
                request.onerror = function(event) {
                  console.error(event);
                };
              } else {
                encryption
                  .decrypt(obj.blob === "" ? "{}" : obj.blob)
                  .then(json => {
                    obj = Object.assign({}, obj, json);
                    delete obj.blob;

                    if (obj.amount) {
                      obj.local_amount = obj.amount;
                      delete obj.amount;
                    }

                    if (obj.date && obj.name) {
                      // Populate data for indexedb indexes
                      const year = obj.date.slice(0, 4);
                      const month = obj.date.slice(5, 7);
                      const day = obj.date.slice(8, 10);

                      obj.date = new Date(
                        Date.UTC(year, month - 1, day, 0, 0, 0)
                      );

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

                      const saveObject = obj => {
                        var request = customerObjectStore.put(obj);
                        request.onsuccess = function(event) {
                          addObject(i);
                        };
                        request.onerror = function(event) {
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
                  .catch(exception => {
                    console.error(exception);
                    postMessage({
                      type: ENCRYPTION_ERROR
                    });
                  });
              }
            } else {
              postMessage({
                type: TRANSACTIONS_SYNC_REQUEST,
                last_edited
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

      // Connect to indexedDB
      let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
      connectDB.onsuccess = function(event) {
        var customerObjectStore = event.target.result
          .transaction("transactions", "readwrite")
          .objectStore("transactions");

        // Save new transaction
        var request = customerObjectStore.put(response_transaction);

        request.onsuccess = function(event) {
          const transaction = {
            id: response_transaction.id,
            account: response_transaction.account,
            name: response_transaction.name,
            date: response_transaction.date,
            originalAmount: response_transaction.local_amount,
            originalCurrency: response_transaction.local_currency,
            category: response_transaction.category,
            // Calculated value
            isConversionAccurate: true, // Define is exchange rate is exact or estimated
            isConversionFromFuturChange: false, // If we used future change to make calculation
            isSecondDegreeRate: false, // If we used future change to make calculation
            amount: response_transaction.local_amount,
            currency: response_transaction.local_currency
          };

          convertTo(transaction, action.currency, transaction.account).then(
            () => {
              postMessage({
                type: action.type,
                transaction: transaction
              });
            }
          );
        };
        request.onerror = function(event) {
          console.error(event);
        };
      };
      connectDB.onerror = function(event) {
        console.error(event);
      };
      break;
    }
    case TRANSACTIONS_READ_REQUEST: {
      cachedChain = null;

      retrieveTransactions(action.account, action.currency)
        .then(result => {
          const { transactions, youngest, oldest } = result;
          postMessage({
            type: TRANSACTIONS_READ_REQUEST,
            transactions,
            youngest,
            oldest
          });
        })
        .catch(e => {
          console.error(e);
        });

      break;
    }
    case TRANSACTIONS_EXPORT: {
      exportTransactions(action.account)
        .then(transactions => {
          postMessage({
            type: TRANSACTIONS_EXPORT,
            transactions
          });
        })
        .catch(exception => {
          postMessage({
            type: TRANSACTIONS_EXPORT,
            exception
          });
        });

      break;
    }
    case TRANSACTIONS_UPDATE_REQUEST: {
      let response_transaction = action.transaction;

      // Connect to indexedDB
      let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
      connectDB.onsuccess = function(event) {
        var customerObjectStore = event.target.result
          .transaction("transactions", "readwrite")
          .objectStore("transactions");

        // Save new transaction
        var request = customerObjectStore.put(response_transaction);

        request.onsuccess = function(event) {
          const transaction = {
            id: response_transaction.id,
            account: response_transaction.account,
            name: response_transaction.name,
            date: response_transaction.date,
            originalAmount: response_transaction.local_amount,
            originalCurrency: response_transaction.local_currency,
            category: response_transaction.category,
            // Calculated value
            isConversionAccurate: true, // Define is exchange rate is exact or estimated
            isConversionFromFuturChange: false, // If we used future change to make calculation
            isSecondDegreeRate: false, // If we used future change to make calculation
            amount: response_transaction.local_amount,
            currency: response_transaction.local_currency
          };

          convertTo(transaction, action.currency, transaction.account).then(
            () => {
              postMessage({
                type: action.type,
                transaction: transaction
              });
            }
          );
        };
        request.onerror = function(event) {
          console.error(event);
        };
      };
      connectDB.onerror = function(event) {
        console.error(event);
      };

      break;
    }

    case UPDATE_ENCRYPTION: {
      encryption.key(action.cipher).then(() => {
        // Load transactions store
        var connectDB = indexedDB.open(DB_NAME, DB_VERSION);
        connectDB.onsuccess = function(event) {
          var customerObjectStore = event.target.result
            .transaction("transactions", "readwrite")
            .objectStore("transactions")
            .openCursor();

          var transactions = [];
          customerObjectStore.onsuccess = function(event) {
            var cursor = event.target.result;
            // If cursor.continue() still have data to parse.
            if (cursor) {
              const transaction = cursor.value;

              transactions.push({
                id: transaction.id,
                blob: generateBlob(transaction)
              });
              cursor.continue();
            } else {
              var iterator = transactions.entries();

              let result = iterator.next();

              const promise = new Promise((resolve, reject) => {
                var iterate = () => {
                  if (!result.done) {
                    // console.log(result.value[1].id); // 1 3 5 7 9
                    encryption
                      .encrypt(result.value[1].blob)
                      .then(json => {
                        result.value[1].blob = json;
                        result = iterator.next();
                        iterate();
                      })
                      .catch(error => {
                        console.error(error);
                        reject();
                      });
                  } else {
                    resolve();
                  }
                };
                iterate();
              });

              promise.then(() => {
                axios({
                  url: action.url + "/api/v1/debitscredits",
                  method: "PATCH",
                  headers: {
                    Authorization: "Token " + action.token
                  },
                  data: transactions
                })
                  .then(response => {
                    postMessage({
                      type: action.type
                    });
                  })
                  .catch(exception => {
                    console.error(exception);
                  });
              });
            }
          };

          customerObjectStore.onerror = function(event) {
            console.error(event);
          };
        };
      });
      break;
    }
    case FLUSH: {
      const { accounts } = action;

      if (accounts) {
        // For each account, we select all transaction, and delete them one by one.
        accounts.forEach(account => {
          var connectDB = indexedDB.open(DB_NAME, DB_VERSION);
          connectDB.onsuccess = function(event) {
            var customerObjectStore = event.target.result
              .transaction("transactions", "readwrite")
              .objectStore("transactions")
              .index("account")
              .openCursor(IDBKeyRange.only(account));

            customerObjectStore.onsuccess = function(event) {
              var cursor = event.target.result;
              // If cursor.continue() still have data to parse.
              if (cursor) {
                cursor.delete();
                cursor.continue();
              }
            };
          };
        });
      } else {
        var connectDB = indexedDB.open(DB_NAME, DB_VERSION);
        connectDB.onsuccess = function(event) {
          var customerObjectStore = event.target.result
            .transaction("transactions", "readwrite")
            .objectStore("transactions");

          customerObjectStore.clear();
        };
      }

      break;
    }
    case ENCRYPTION_KEY_CHANGED: {
      const { url, token, newCipher, oldCipher } = action;

      axios({
        url: url + "/api/v1/debitscredits",
        method: "get",
        headers: {
          Authorization: "Token " + token
        }
      })
        .then(function(response) {
          let promises = [];
          const transactions = [];

          encryption.key(oldCipher).then(() => {
            response.data.forEach(transaction => {
              promises.push(
                new Promise((resolve, reject) => {
                  encryption
                    .decrypt(transaction.blob === "" ? "{}" : transaction.blob)
                    .then(json => {
                      delete transaction.blob;
                      transactions.push({
                        id: transaction.id,
                        blob: json
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
                  transactions.forEach(transaction => {
                    promises.push(
                      new Promise((resolve, reject) => {
                        encryption
                          .encrypt(
                            transaction.blob === "" ? "{}" : transaction.blob
                          )
                          .then(json => {
                            transaction.blob = json;
                            resolve();
                          });
                      })
                    );
                  });

                  Promise.all(promises)
                    .then(_ => {
                      axios({
                        url: url + "/api/v1/debitscredits",
                        method: "PATCH",
                        headers: {
                          Authorization: "Token " + token
                        },
                        data: transactions
                      })
                        .then(response => {
                          postMessage({
                            type: action.type
                          });
                        })
                        .catch(exception => {
                          postMessage({
                            type: action.type,
                            exception
                          });
                        });
                    })
                    .catch(exception => {
                      postMessage({
                        type: action.type,
                        exception
                      });
                    });
                });
              })
              .catch(exception => {
                postMessage({
                  type: action.type,
                  exception
                });
              });
          });
        })
        .catch(exception => {
          postMessage({
            type: action.type,
            exception
          });
        });
      break;
    }
    default:
      return;
  }
};

// Connect to IndexedDB to retrieve a list of transaction for account and converted in currency
function retrieveTransactions(account, currency) {
  let transactions = []; // Set object of Transaction

  return new Promise((resolve, reject) => {
    let connectDB = indexedDB.open(DB_NAME, DB_VERSION);

    connectDB.onsuccess = function(event) {
      let cursor = event.target.result
        .transaction("transactions")
        .objectStore("transactions")
        .index("account")
        .openCursor(IDBKeyRange.only(account));

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
              currency: cursor.value.local_currency
            });
          }
          cursor.continue();
        } else {
          let youngest = new Date();
          let oldest = new Date();

          /* At this point, we have a list of transaction.
             We need to convert to currency in params */
          if (transactions.length === 0) {
            return resolve({ transactions, youngest, oldest });
          }

          let promises = [];
          let counter = 0;

          getCachedChangeChain(account).then(chain => {
            transactions.forEach(transaction => {
              transaction.date = new Date(transaction.date);
              if (transaction.date < youngest) {
                youngest = transaction.date;
              } else if (transaction.date > oldest) {
                oldest = transaction.date;
              }
              promises.push(convertTo(transaction, currency, account));
              counter++;
              // If last transaction to convert we send nessage back.
              if (counter === transactions.length) {
                Promise.all(promises).then(() => {
                  resolve({ transactions, youngest, oldest });
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

// Convert a transation to a specific currencyId
function convertTo(transaction, currencyId, accountId) {
  return new Promise((resolve, reject) => {
    try {
      if (currencyId === transaction.originalCurrency) {
        transaction.isConversionAccurate = true;
        transaction.amount = transaction.originalAmount;
        resolve();
      } else {
        getCachedChangeChain(accountId)
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
                change.rates[transaction.originalCurrency] &&
                change.rates[transaction.originalCurrency][currencyId]
              ) {
                transaction.isConversionAccurate = true;
                transaction.amount =
                  transaction.originalAmount *
                  change.rates[transaction.originalCurrency][currencyId];
              } else {
                // We take first Rating is available
                if (
                  change.secondDegree[transaction.originalCurrency] &&
                  change.secondDegree[transaction.originalCurrency][currencyId]
                ) {
                  transaction.isSecondDegreeRate = true;
                  transaction.amount =
                    transaction.originalAmount *
                    change.secondDegree[transaction.originalCurrency][
                      currencyId
                    ];
                } else {
                  // We take secondDegree transaction if possible
                  if (
                    firstRating[transaction.originalCurrency] &&
                    firstRating[transaction.originalCurrency][currencyId]
                  ) {
                    transaction.isConversionFromFuturChange = true;
                    transaction.amount =
                      transaction.originalAmount *
                      firstRating[transaction.originalCurrency][currencyId];
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
function getCachedChangeChain(accountId) {
  return new Promise((resolve, reject) => {
    if (cachedChain) {
      resolve(cachedChain);
    } else {
      getChangeChain(accountId).then(chain => {
        cachedChain = chain;
        resolve(chain);
      });
    }
  });
}

function exportTransactions(account) {
  let transactions = []; // Set object of Transaction

  return new Promise((resolve, reject) => {
    let connectDB = indexedDB.open(DB_NAME, DB_VERSION);

    connectDB.onsuccess = function(event) {
      let cursor = event.target.result
        .transaction("transactions")
        .objectStore("transactions")
        .index("account")
        .openCursor(IDBKeyRange.only(account));

      cursor.onsuccess = function(event) {
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
              category: cursor.value.category
            });
          }
          cursor.continue();
        } else {
          resolve(transactions);
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
