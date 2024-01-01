import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  ENCRYPTION_KEY_CHANGED,
  FLUSH,
  SERVER_LAST_EDITED,
  SNACKBAR,
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
  TRANSACTIONS_EXPORT,
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_SWITCH_ID,
  TRANSACTIONS_SYNC_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
} from "../constants";
import encryption from "../encryption";
import storage from "../storage";

import ServerActions from "./ServerActions";

import { dateToString } from "../utils/date";
import Worker from "../workers/Transactions.worker";
const worker = new Worker();

function generateBlob(transaction) {
  const blob = {};

  blob.name = transaction.name;
  blob.date = dateToString(
    transaction.beforeAdjustmentDate || transaction.date
  );
  blob.local_amount =
    transaction.beforeAdjustmentAmount || transaction.originalAmount;
  blob.local_currency = transaction.originalCurrency;
  // If transaction is recurrent, we add frequency and duration
  if (transaction.frequency && transaction.duration) {
    blob.frequency = transaction.frequency;
    blob.duration = transaction.duration;
  }
  blob.isPending = transaction.isPending;
  blob.adjustments = transaction.adjustments;
  return blob;
}

var TransactionsActions = {
  sync: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        // If no accounts we return empty list of transactions
        if (getState().accounts.remote.length === 0) {
          dispatch({
            type: TRANSACTIONS_READ_REQUEST,
            transactions: null,
          });
          resolve();
        } else {
          const sync_transactions = getState().sync.transactions;

          const create_promise = new Promise((resolve, reject) => {
            if (sync_transactions.create && sync_transactions.create.length) {
              let promises = [];
              let transactions = [];

              getState()
                .transactions.filter(
                  (c) =>
                    sync_transactions.create.indexOf(c.id) != -1 &&
                    !c.isRecurrent
                )
                .forEach((t) => {
                  // Create a promise to encrypt data
                  promises.push(
                    new Promise((resolve, reject) => {
                      const blob = generateBlob(t);

                      encryption
                        .encrypt(blob)
                        .then((json) => {
                          const transaction = {
                            account: t.account,
                            category: t.category,
                            blob: json,
                            old: t.id,
                          };

                          // API return 400 if catery = null
                          if (!transaction.category) {
                            delete transaction.category;
                          }

                          transactions.push(transaction);
                          resolve();
                        })
                        .catch((exception) => {
                          console.error(exception);
                          reject(exception);
                        });
                    })
                  );
                });

              Promise.all(promises)
                .then((_) => {
                  return axios({
                    url: "/api/v1/debitscredits",
                    method: "POST",
                    headers: {
                      Authorization: "Token " + getState().user.token,
                    },
                    data: transactions,
                  }).then((response) => {
                    return storage.connectIndexedDB().then((connection) => {
                      var customerObjectStore = connection
                        .transaction("transactions", "readwrite")
                        .objectStore("transactions");
                      // Delete previous non synced objects
                      sync_transactions.create.forEach((id) => {
                        customerObjectStore.delete(id);
                      });

                      response.data.forEach((transaction) => {
                        const old_transaction = transactions.find(
                          (t) => (transaction.blob = t.blob)
                        );
                        dispatch({
                          type: TRANSACTIONS_SWITCH_ID,
                          old: old_transaction.old,
                          new: transaction.id,
                        });
                      });

                      resolve();
                    });
                  });
                })
                .catch((exception) => {
                  console.error(exception);
                  reject(exception);
                });
            } else {
              resolve();
            }
          });
          const update_promise = new Promise((resolve) => {
            if (sync_transactions.update && sync_transactions.update.length) {
              let promises = [];
              let transactions = [];

              getState()
                .transactions.filter(
                  (c) =>
                    sync_transactions.update.indexOf(c.id) != -1 &&
                    !c.isRecurrent
                )
                .forEach((transaction) => {
                  // Create a promise to encrypt data
                  promises.push(
                    new Promise((resolve, reject) => {
                      const blob = generateBlob(transaction);

                      encryption
                        .encrypt(blob)
                        .then((json) => {
                          transaction = {
                            id: transaction.id,
                            account: transaction.account,
                            category: transaction.category,
                            blob: json,
                          };

                          // API return 400 if catery = null
                          if (!transaction.category) {
                            delete transaction.category;
                          }

                          transactions.push(transaction);
                          resolve();
                        })
                        .catch((exception) => {
                          console.error(exception);
                          reject(exception);
                        });
                    })
                  );
                });

              Promise.all(promises)
                .then((_) => {
                  axios({
                    url: "/api/v1/debitscredits",
                    method: "PUT",
                    headers: {
                      Authorization: "Token " + getState().user.token,
                    },
                    data: transactions,
                  })
                    .then((response) => {
                      resolve();
                    })
                    .catch((exception) => {
                      reject(exception);
                    });
                })
                .catch((exception) => {
                  console.error(exception);
                  reject(exception);
                });
            } else {
              resolve();
            }
          });
          const delete_promise = new Promise((resolve) => {
            if (sync_transactions.delete && sync_transactions.delete.length) {
              if (sync_transactions.delete && sync_transactions.delete.length) {
                axios({
                  url: "/api/v1/debitscredits",
                  method: "DELETE",
                  headers: {
                    Authorization: "Token " + getState().user.token,
                  },
                  data: sync_transactions.delete,
                })
                  .then((response) => {
                    resolve();
                  })
                  .catch((error) => {
                    console.error(error);
                    reject(error.response);
                  });
              } else {
                resolve();
              }
            } else {
              resolve();
            }
          });

          Promise.all([create_promise, update_promise, delete_promise]).then(
            () => {
              const { last_edited } = getState().server;
              let url = "/api/v1/debitscredits";
              if (last_edited) {
                url = url + "?last_edited=" + last_edited;
              }
              axios({
                url: url,
                method: "get",
                headers: {
                  Authorization: "Token " + getState().user.token,
                },
              })
                .then(function (response) {
                  if (response.data.length === 0) {
                    // If first sync, and no transactions, we return empty array
                    if (!getState().transactions) {
                      dispatch({
                        type: TRANSACTIONS_READ_REQUEST,
                        transactions: [],
                        youngest: new Date(),
                        oldest: new Date(),
                      });
                    }
                    resolve();
                  } else {
                    // SYNC
                    const uuid = uuidv4();
                    worker.onmessage = function (event) {
                      if (event.data.uuid == uuid) {
                        if (
                          event.data.type === TRANSACTIONS_SYNC_REQUEST &&
                          !event.data.exception
                        ) {
                          dispatch({
                            type: SERVER_LAST_EDITED,
                            last_edited: event.data.last_edited,
                          });

                          // If we receive the same number of transaction as edited, we ignore READ.
                          const counter =
                            sync_transactions.update.length +
                            sync_transactions.create.length +
                            sync_transactions.delete.length;

                          if (response.data.length === counter) {
                            resolve();
                          } else {
                            worker.postMessage({
                              uuid,
                              type: TRANSACTIONS_READ_REQUEST,
                              account: getState().account.id,
                              url: getState().server.url,
                              token: getState().user.token,
                              currency: getState().account.currency,
                              cipher: getState().user.cipher,
                            });
                          }
                        } else if (
                          event.data.type === TRANSACTIONS_READ_REQUEST &&
                          !event.data.exception
                        ) {
                          dispatch({
                            type: TRANSACTIONS_READ_REQUEST,
                            transactions: event.data.transactions,
                            youngest: event.data.youngest,
                            oldest: event.data.oldest,
                          });
                          resolve();
                        } else {
                          reject(event.data.exception);
                        }
                      }
                    };
                    worker.onerror = function (exception) {
                      console.log(exception);
                      reject(exception);
                    };
                    worker.postMessage({
                      uuid,
                      type: TRANSACTIONS_SYNC_REQUEST,
                      account: getState().account.id,
                      url: getState().server.url,
                      token: getState().user.token,
                      currency: getState().account.currency,
                      cipher: getState().user.cipher,
                      transactions: response.data,
                      last_edited,
                    });
                  }
                })
                .catch(function (ex) {
                  console.error(ex);
                  reject(ex);
                });
            }
          );
        }
      });
    };
  },

  get: (id = null) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        if (!id) {
          throw new Error(
            "TransactionActions.get() missing required parameter"
          );
        }
        const uuid = uuidv4();
        worker.onmessage = function (event) {
          if (event.data.uuid == uuid) {
            if (!event.data.exception) {
              resolve(event.data.transaction);
            } else {
              console.error(event.data.exception);
              reject(event.data.exception);
            }
          }
        };
        worker.onerror = function (exception) {
          console.log(exception);
          reject(exception);
        };

        worker.postMessage({
          uuid,
          id,
          type: TRANSACTIONS_READ_REQUEST,
          account: getState().account.id,
          url: getState().server.url,
          token: getState().user.token,
          currency: getState().account.currency,
          cipher: getState().user.cipher,
        });
      });
    };
  },

  refresh: (transactions = null) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const uuid = uuidv4();
        worker.onmessage = function (event) {
          if (event.data.uuid == uuid) {
            if (!event.data.exception) {
              dispatch({
                type: TRANSACTIONS_READ_REQUEST,
                transactions: event.data.transactions,
                youngest: event.data.youngest,
                oldest: event.data.oldest,
              });
              resolve();
            } else {
              console.error(event.data.exception);
              reject(event.data.exception);
            }
          }
        };
        worker.onerror = function (exception) {
          console.log(exception);
          reject(exception);
        };

        worker.postMessage({
          uuid,
          transactions,
          type: TRANSACTIONS_READ_REQUEST,
          account: getState().account.id,
          url: getState().server.url,
          token: getState().user.token,
          currency: getState().account.currency,
          cipher: getState().user.cipher,
        });
      });
    };
  },

  create: (transaction, ignoreSync = false) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        transaction.id = uuidv4();

        transaction.local_amount =
          transaction.local_amount || transaction.amount || 0;
        transaction.local_currency =
          transaction.local_currency || transaction.currency;

        const uuid = uuidv4();
        worker.onmessage = function (event) {
          if (event.data.uuid == uuid) {
            if (!event.data.exception) {
              dispatch({
                type: TRANSACTIONS_CREATE_REQUEST,
                transactions: event.data.transactions,
                isLocal: getState().account.isLocal,
              });

              const account = getState().account;
              const autoSync = getState().user?.profile?.profile?.auto_sync;
              if (!account.isLocal && !ignoreSync && autoSync) {
                dispatch(ServerActions.sync());
              }

              resolve();
            } else {
              console.error(event.data.exception);
              reject(event.data.exception);
            }
          }
        };
        worker.onerror = function (exception) {
          console.log(exception);
          reject(exception);
        };

        worker.postMessage({
          uuid,
          type: TRANSACTIONS_CREATE_REQUEST,
          account: getState().account.id,
          url: getState().server.url,
          token: getState().user.token,
          currency: getState().account.currency,
          cipher: getState().user.cipher,
          transaction,
        });
      });
    };
  },

  update: (transaction) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const uuid = uuidv4();
        worker.onmessage = function (event) {
          if (event.data.uuid == uuid) {
            if (!event.data.exception) {
              dispatch({
                type: TRANSACTIONS_UPDATE_REQUEST,
                transactions: event.data.transactions,
                isLocal: getState().account.isLocal,
              });
              const account = getState().account;
              const autoSync = getState().user?.profile?.profile?.auto_sync;
              if (!account.isLocal && autoSync) {
                dispatch(ServerActions.sync());
              }
              resolve();
            } else {
              console.error(event.data.exception);
              reject(event.data.exception);
            }
          }
        };
        worker.onerror = function (exception) {
          console.log(exception);
          reject(exception);
        };

        worker.postMessage({
          uuid,
          type: TRANSACTIONS_UPDATE_REQUEST,
          account: getState().account.id,
          url: getState().server.url,
          token: getState().user.token,
          currency: getState().account.currency,
          cipher: getState().user.cipher,
          transaction,
        });
      });
    };
  },

  delete: (transaction) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        dispatch({
          type: SNACKBAR,
          snackbar: {
            message: "Transaction successfuly deleted",
            onClick: function () {
              transaction.date = dateToString(transaction.date);
              dispatch(TransactionsActions.create(transaction));
            },
          },
        });

        storage.connectIndexedDB().then((connection) => {
          var customerObjectStore = connection
            .transaction("transactions", "readwrite")
            .objectStore("transactions");

          // Save new transaction
          var request = customerObjectStore.delete(transaction.id);

          request.onsuccess = function (event) {
            dispatch({
              type: TRANSACTIONS_DELETE_REQUEST,
              id: transaction.id,
              transaction,
              isLocal: getState().account.isLocal,
            });

            const account = getState().account;
            const autoSync = getState().user?.profile?.profile?.auto_sync;
            if (!account.isLocal && autoSync) {
              dispatch(ServerActions.sync());
            }

            resolve();
          };
          request.onerror = function (event) {
            console.error(event);
            reject(event);
          };
        });
      });
    };
  },

  export: (id) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const uuid = uuidv4();
        worker.onmessage = function (event) {
          if (event.data.uuid == uuid) {
            resolve({
              transactions: event.data.transactions,
            });
          }
        };
        worker.onerror = function (exception) {
          console.log(exception);
          reject(exception);
        };
        worker.postMessage({
          uuid,
          type: TRANSACTIONS_EXPORT,
          account: id,
        });
      });
    };
  },

  updateServerEncryption: (url, token, newCipher, oldCipher) => {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      worker.onmessage = function (event) {
        if (event.data.uuid == uuid) {
          resolve();
        }
      };
      worker.onerror = function (exception) {
        console.log(exception);
        reject(exception);
      };
      worker.postMessage({
        uuid,
        type: ENCRYPTION_KEY_CHANGED,
        url,
        token,
        newCipher,
        oldCipher,
      });
    });
  },

  flush: (accounts = null) => {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      worker.onmessage = function (event) {
        if (event.data.uuid == uuid) {
          resolve(event.data);
        }
      };
      worker.onerror = function (exception) {
        console.log(exception);
        reject(exception);
      };
      worker.postMessage({
        uuid,
        type: FLUSH,
        accounts,
      });
    });
  },
};

export default TransactionsActions;
