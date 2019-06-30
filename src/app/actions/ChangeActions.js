import {
  CHANGES_READ_REQUEST,
  CHANGES_CREATE_REQUEST,
  CHANGES_UPDATE_REQUEST,
  CHANGES_DELETE_REQUEST,
  CHANGES_EXPORT,
  SERVER_SYNC,
  SERVER_SYNCED,
  SERVER_LAST_EDITED,
  UPDATE_ENCRYPTION,
  ENCRYPTION_KEY_CHANGED,
  FLUSH
} from "../constants";

import axios from "axios";
import storage from "../storage";
import encryption from "../encryption";

import TransactionsActions from "./TransactionActions";
import ServerActions from "./ServerActions";

import Worker from "../workers/Changes.worker";
const worker = new Worker();

var ChangesActions = {
  sync: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const sync_changes = getState().sync.changes;

        //
        const create_promise = new Promise(resolve => {
          if (sync_changes.create && sync_changes.create.length) {
            let promises = [];
            let changes = [];

            getState()
              .changes.list.filter(c => sync_changes.create.indexOf(c.id) != -1)
              .forEach(change => {
                // Create a promise to encrypt data
                promises.push(
                  new Promise((resolve, reject) => {
                    const blob = {};

                    blob.name = change.name;
                    blob.date = (change.date instanceof Date
                      ? change.date.toISOString()
                      : change.date
                    ).slice(0, 10);
                    blob.local_amount = change.local_amount;
                    blob.local_currency = change.local_currency;
                    blob.new_amount = change.new_amount;
                    blob.new_currency = change.new_currency;

                    encryption
                      .encrypt(blob)
                      .then(json => {
                        change.blob = json;

                        delete change.id;
                        delete change.name;
                        delete change.date;
                        delete change.local_amount;
                        delete change.local_currency;
                        delete change.new_amount;
                        delete change.new_currency;

                        changes.push(change);
                        resolve();
                      })
                      .catch(exception => {
                        console.error(exception);
                        reject(exception);
                      });
                  })
                );
              });
            Promise.all(promises)
              .then(_ => {
                axios({
                  url: "/api/v1/changes",
                  method: "POST",
                  headers: {
                    Authorization: "Token " + getState().user.token
                  },
                  data: changes
                }).then(response => {
                  storage
                    .connectIndexedDB()
                    .then(connection => {
                      var customerObjectStore = connection
                        .transaction("changes", "readwrite")
                        .objectStore("changes");

                      // Delete previous non synced objects
                      sync_changes.create.forEach(id => {
                        customerObjectStore.delete(id);
                      });

                      resolve();
                    })
                    .catch(exception => {
                      console.error(exception);
                      reject(exception);
                    });
                });
              })
              .catch(exception => {
                console.error(exception);
                reject(exception);
              });
          } else {
            resolve();
          }
        });

        const update_promise = new Promise(resolve => {
          if (sync_changes.update && sync_changes.update.length) {
            let promises = [];
            let changes = [];

            getState()
              .changes.list.filter(c => sync_changes.update.indexOf(c.id) != -1)
              .forEach(change => {
                // Create a promise to encrypt data
                promises.push(
                  new Promise((resolve, reject) => {
                    const blob = {};

                    blob.name = change.name;
                    blob.date = (change.date instanceof Date
                      ? change.date.toISOString()
                      : change.date
                    ).slice(0, 10);
                    blob.local_amount = change.local_amount;
                    blob.local_currency = change.local_currency;
                    blob.new_amount = change.new_amount;
                    blob.new_currency = change.new_currency;

                    encryption
                      .encrypt(blob)
                      .then(json => {
                        change.blob = json;

                        delete change.name;
                        delete change.date;
                        delete change.local_amount;
                        delete change.local_currency;
                        delete change.new_amount;
                        delete change.new_currency;

                        changes.push(change);
                        resolve();
                      })
                      .catch(exception => {
                        console.error(exception);
                        reject(exception);
                      });
                  })
                );
              });
            Promise.all(promises)
              .then(_ => {
                axios({
                  url: "/api/v1/changes",
                  method: "PUT",
                  headers: {
                    Authorization: "Token " + getState().user.token
                  },
                  data: changes
                }).then(response => {
                  resolve();
                });
              })
              .catch(exception => {
                console.error(exception);
                reject(exception);
              });
          } else {
            resolve();
          }
        });
        // Delete changes
        const delete_promise = new Promise((resolve, reject) => {
          if (sync_changes.delete && sync_changes.delete.length) {
            axios({
              url: "/api/v1/changes",
              method: "DELETE",
              headers: {
                Authorization: "Token " + getState().user.token
              },
              data: sync_changes.delete
            })
              .then(response => {
                resolve();
              })
              .catch(error => {
                console.error(error);
                reject(error.response);
              });
          } else {
            resolve();
          }
        });

        // When sync is done, we get data from server and update user interface
        Promise.all([create_promise, update_promise, delete_promise])
          .then(() => {
            const { last_edited } = getState().server;
            let url = "/api/v1/changes";
            if (last_edited) {
              url = url + "?last_edited=" + last_edited;
            }

            axios({
              url: url,
              method: "get",
              headers: {
                Authorization: "Token " + getState().user.token
              }
            })
              .then(function(response) {
                if (
                  (!last_edited && response.data.length === 0) ||
                  !getState().account.id
                ) {
                  dispatch({
                    type: CHANGES_READ_REQUEST,
                    list: [],
                    chain: []
                  });
                  resolve();
                } else {
                  // Load transactions store
                  storage.connectIndexedDB().then(connection => {
                    var customerObjectStore = connection
                      .transaction("changes", "readwrite")
                      .objectStore("changes");

                    let { last_edited } = getState().server;

                    // Delete all previous objects
                    if (!last_edited) {
                      customerObjectStore.clear();
                    }

                    const addObject = i => {
                      let obj = i.next();

                      if (obj && obj.value) {
                        // Save in storage.
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
                            reject();
                          };
                        } else {
                          encryption
                            .decrypt(obj.blob === "" ? "{}" : obj.blob)
                            .then(json => {
                              obj = Object.assign({}, obj, json);
                              delete obj.blob;

                              if (obj.date && obj.name) {
                                obj.year = obj.date.slice(0, 4);
                                obj.month = obj.date.slice(5, 7);
                                obj.day = obj.date.slice(8, 10);
                                obj.date = new Date(
                                  obj.year,
                                  obj.month - 1,
                                  obj.day,
                                  0,
                                  0,
                                  0
                                );

                                if (
                                  !last_edited ||
                                  obj.last_edited > last_edited
                                ) {
                                  last_edited = obj.last_edited;
                                }

                                const saveObject = obj => {
                                  var request = customerObjectStore.put(obj);
                                  request.onsuccess = function(event) {
                                    addObject(i);
                                  };
                                  request.onerror = function(event) {
                                    console.error(event);
                                    reject();
                                  };
                                };

                                try {
                                  saveObject(obj);
                                } catch (exception) {
                                  if (exception instanceof DOMException) {
                                    customerObjectStore = connection
                                      .transaction("changes", "readwrite")
                                      .objectStore("changes");
                                    saveObject(obj);
                                  } else {
                                    reject(exception);
                                  }
                                }
                              } else {
                                addObject(i);
                              }
                            })
                            .catch(exception => {
                              console.error(exception);
                              reject();
                            });
                        }
                      } else {
                        worker.onmessage = function(event) {
                          if (event.data.type === CHANGES_READ_REQUEST) {
                            dispatch({
                              type: SERVER_LAST_EDITED,
                              last_edited: last_edited
                            });

                            dispatch({
                              type: CHANGES_READ_REQUEST,
                              list: event.data.changes,
                              chain: event.data.chain
                            });
                            resolve();
                          } else {
                            console.error(event);
                            reject(event);
                          }
                        };
                        worker.postMessage({
                          type: CHANGES_READ_REQUEST,
                          account: getState().account.id
                        });
                      }
                    };

                    var iterator = response.data.entries();
                    addObject(iterator);
                  });
                }
              })
              .catch(function(ex) {
                console.error(ex);
                reject();
              });
          })
          .catch(function(ex) {
            console.error(ex);
            reject();
          });
      });
    };
  },

  refresh: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        worker.onmessage = function(event) {
          if (event.data.type === CHANGES_READ_REQUEST) {
            dispatch({
              type: CHANGES_READ_REQUEST,
              list: event.data.changes,
              chain: event.data.chain
            });
            resolve();
          } else {
            console.error(event);
            reject(event);
          }
        };
        worker.postMessage({
          type: CHANGES_READ_REQUEST,
          account: getState().account.id
        });
      });
    };
  },

  create: change => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        let maxId = 0;
        getState().changes.list.forEach(
          change => (maxId = change.id > maxId ? change.id : maxId)
        );

        change.id = maxId + 1;
        change.date = new Date(change.date);

        storage.connectIndexedDB().then(connection => {
          connection
            .transaction("changes", "readwrite")
            .objectStore("changes")
            .put(change);

          dispatch({
            type: CHANGES_CREATE_REQUEST,
            change
          });

          worker.onmessage = function(event) {
            if (event.data.type === CHANGES_READ_REQUEST) {
              dispatch({
                type: CHANGES_READ_REQUEST,
                list: event.data.changes,
                chain: event.data.chain
              });
              dispatch(TransactionsActions.refresh())
                .then(() => {
                  dispatch(ServerActions.sync());
                  resolve();
                })
                .catch(() => reject());
            } else {
              console.error(event);
              reject(event);
            }
          };
          worker.postMessage({
            type: CHANGES_READ_REQUEST,
            account: getState().account.id
          });
        });
      });
    };
  },

  update: change => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        change.date = new Date(change.date);

        storage.connectIndexedDB().then(connection => {
          connection
            .transaction("changes", "readwrite")
            .objectStore("changes")
            .put(change);

          dispatch({
            type: CHANGES_UPDATE_REQUEST,
            change
          });

          worker.onmessage = function(event) {
            if (event.data.type === CHANGES_READ_REQUEST) {
              dispatch({
                type: CHANGES_READ_REQUEST,
                list: event.data.changes,
                chain: event.data.chain
              });
              dispatch(ServerActions.sync());
              dispatch(TransactionsActions.refresh())
                .then(() => {
                  dispatch(ServerActions.sync());
                  resolve();
                })
                .catch(() => reject());
            } else {
              console.error(event);
              reject(event);
            }
          };
          worker.postMessage({
            type: CHANGES_READ_REQUEST,
            account: getState().account.id
          });
        });
      });
    };
  },

  delete: change => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        storage.connectIndexedDB().then(connection => {
          connection
            .transaction("changes", "readwrite")
            .objectStore("changes")
            .delete(change.id);

          dispatch({
            type: CHANGES_DELETE_REQUEST,
            id: change.id
          });

          worker.onmessage = function(event) {
            if (event.data.type === CHANGES_READ_REQUEST) {
              dispatch({
                type: CHANGES_READ_REQUEST,
                list: event.data.changes,
                chain: event.data.chain
              });
              dispatch(TransactionsActions.refresh())
                .then(() => {
                  dispatch(ServerActions.sync());
                  resolve();
                })
                .catch(() => {
                  reject();
                });
            } else {
              console.error(event);
              reject(event);
            }
          };
          worker.postMessage({
            type: CHANGES_READ_REQUEST,
            account: getState().account.id
          });
        });
      });
    };
  },

  export: id => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        worker.onmessage = function(event) {
          if (event.data.type === CHANGES_EXPORT) {
            resolve({
              changes: event.data.changes
            });
          } else {
            console.error(event);
            reject(event);
          }
        };
        worker.postMessage({
          type: CHANGES_EXPORT,
          account: id
        });
      });
    };
  },

  encrypt: (cipher, url, token) => {
    return new Promise((resolve, reject) => {
      worker.onmessage = function(event) {
        if (event.data.type === UPDATE_ENCRYPTION) {
          resolve();
        } else {
          console.error(event);
          reject(event);
        }
      };
      worker.postMessage({
        type: UPDATE_ENCRYPTION,
        cipher,
        url,
        token
      });
    });
  },

  updateServerEncryption: (url, token, newCipher, oldCipher) => {
    return new Promise((resolve, reject) => {
      worker.onmessage = function(event) {
        if (event.data.type === ENCRYPTION_KEY_CHANGED) {
          resolve();
        } else {
          console.error(event);
          reject(event);
        }
      };
      worker.postMessage({
        type: ENCRYPTION_KEY_CHANGED,
        url,
        token,
        newCipher,
        oldCipher
      });
    });
  },

  flush: () => {
    worker.postMessage({
      type: FLUSH
    });
  },

  process: currencyId => {
    const sortChanges = (a, b) => {
      if (a.date > b.date) {
        return -1;
      } else if (a.date < b.date) {
        return 1;
      } else if (a.name > b.name) {
        return -1;
      }
      return 1;
    };

    return (dispatch, getState) => {
      const currencies = getState().currencies; // all currencies
      const changes = getState().changes; // changes from redux, contain list and chain

      const accountCurrencyId = getState().account.currency;

      let previousRate = null;

      let list = []; // List of all changes with rate, trend, and averything
      changes.chain
        .sort(sortChanges)
        .reverse()
        .forEach(item => {
          const change = Object.assign({}, item);
          change.date = new Date(change.date);
          change.local_currency = currencies.find(
            c => c.id === change.local_currency
          );
          change.new_currency = currencies.find(
            c => c.id === change.new_currency
          );

          if (currencyId) {
            if (
              change.rates[accountCurrencyId] &&
              change.rates[accountCurrencyId][currencyId]
            ) {
              change.rate = change.rates[accountCurrencyId][currencyId];
              change.accurate = true;
            } else if (
              change.secondDegree[accountCurrencyId] &&
              change.secondDegree[accountCurrencyId][currencyId]
            ) {
              change.rate = change.secondDegree[accountCurrencyId][currencyId];
              change.accurate = false;
            }

            if (!previousRate) {
              previousRate = change.rate;
            } else {
              if (change.rate < previousRate) {
                change.trend = "up";
              } else if (change.rate > previousRate) {
                change.trend = "down";
              } else if (change.rate === previousRate) {
                change.trend = "flat";
              }
              previousRate = change.rate;
            }
          }

          list.push(change);
        });

      // We sort again to cancel the reverse effect from previous statement
      list.sort(sortChanges);

      let usedCurrency = [];
      let graph = {};

      // Now we generate the graph for each used currency
      if (list && changes && changes.chain && changes.chain.length) {
        const arrayOfUsedCurrency = Object.keys(
          changes.chain[changes.chain.length - 1].rates
        );
        // List all currencies in last block from chain, and not the one used by account
        usedCurrency = currencies.filter(item => {
          return (
            arrayOfUsedCurrency.indexOf(`${item.id}`) != -1 &&
            item.id != accountCurrencyId
          );
        });

        // Generate graph data

        list.forEach(block => {
          Object.keys(block.rates).forEach(key => {
            if (key != accountCurrencyId) {
              let r = block.rates[key][accountCurrencyId];
              if (!r && block.secondDegree) {
                r = block.secondDegree[key]
                  ? block.secondDegree[key][accountCurrencyId]
                  : null;
              }

              if (r) {
                if (!graph[key]) {
                  graph[key] = [];
                }
                graph[key].push({ date: block.date, value: 1 / r });
              }
            }
          });
        });
        // No idea what it does
        if (currencyId) {
          list = list.filter((item, index) => {
            return (
              item.local_currency.id == currencyId ||
              item.new_currency.id == currencyId
            );
          });
        }
      }

      return Promise.resolve({
        list: list,
        usedCurrency: usedCurrency,
        graph: graph
        // accountCurrencyObject,
      });
    };
  }
};

export default ChangesActions;
