import axios from "axios";

import storage from "../storage";
import encryption from "../encryption";
import uuidv4 from "uuid/v4";

import { ACCOUNTS_IMPORT, ENCRYPTION_KEY_CHANGED } from "../constants";

onmessage = function(event) {
  // Action object is the on generated in action object
  const action = event.data;
  const { uuid } = action;

  switch (action.type) {
    case ACCOUNTS_IMPORT: {
      if (action.isLocal) {
        const { json } = event.data;

        const account = json.account;
        account.id = uuidv4();
        account.isLocal = true;
        account.archived = false;
        account.public = false;

        // Update account reference from imported data
        json.transactions.forEach(transaction => {
          transaction.account = account.id;
        });
        json.changes.forEach(change => {
          change.account = account.id;
        });
        json.categories.forEach(category => {
          category.account = account.id;
          if (!category.parent) {
            category.parent = null;
          }
        });

        // UPDATE CATEGORIES
        function recursiveCategoryImport(parent = null) {
          return new Promise((resolve, reject) => {
            const categories = json.categories.filter(c => c.parent == parent);
            if (categories.length === 0) {
              resolve();
            } else {
              categories.forEach(category => {
                const old_id = category.id;
                category.id = uuidv4();

                storage.connectIndexedDB().then(connection => {
                  connection
                    .transaction("categories", "readwrite")
                    .objectStore("categories")
                    .add(category);
                });

                // Update categories parent refrence with new category id
                json.categories.forEach(c2 => {
                  if (c2.parent == old_id) {
                    c2.parent = category.id;
                  }
                });

                // Update transaction reference with new cateogry id
                json.transactions.forEach(transaction => {
                  if (transaction.category == old_id) {
                    transaction.category = category.id;
                  }
                });

                recursiveCategoryImport(category.id)
                  .then(resolve)
                  .catch(reject);
              });
            }
          });
        }

        recursiveCategoryImport()
          .then(() => {
            json.changes.forEach(change => {
              change.id = uuidv4();

              storage.connectIndexedDB().then(connection => {
                connection
                  .transaction("changes", "readwrite")
                  .objectStore("changes")
                  .put(change);
              });
            });

            json.transactions.forEach(transaction => {
              transaction.id = uuidv4();

              storage.connectIndexedDB().then(connection => {
                connection
                  .transaction("transactions", "readwrite")
                  .objectStore("transactions")
                  .put(transaction);
              });
            });

            postMessage({
              uuid,
              type: ACCOUNTS_IMPORT,
              account
            });
          })
          .catch(exception => {
            postMessage({
              uuid,
              type: ACCOUNTS_IMPORT,
              exception
            });
          });

        return;
      }

      encryption.key(action.cipher).then(() => {
        const { json, token, url } = event.data;

        if (!json.categories) {
          json.categories = [];
        }
        if (!json.transactions) {
          json.transactions = [];
        }
        if (!json.changes) {
          json.changes = [];
        }

        delete json.account.id;

        axios({
          url: url + "/api/v1/accounts",
          method: "POST",
          headers: {
            Authorization: "Token " + token
          },
          data: json.account
        })
          .then(response => {
            const account = response.data;
            json.account.id = account.id;
            json.account.isLocal = action.isLocal;

            // Update account reference from imported data
            json.transactions.forEach(transaction => {
              transaction.account = account.id;
            });
            json.changes.forEach(change => {
              change.account = account.id;
            });
            json.categories.forEach(category => {
              category.account = account.id;
              if (!category.parent) {
                category.parent = null;
              }
            });

            // UPDATE CATEGORIES
            function recursiveCategoryImport(parent = null) {
              return new Promise((resolve, reject) => {
                const categories = json.categories.filter(
                  c => c.parent == parent
                );
                if (categories.length === 0) {
                  resolve();
                } else {
                  // We encrypt all categories
                  // WE remove name, description, and parent
                  const encrypt_all = [];
                  categories.forEach(category => {
                    encrypt_all.push(
                      new Promise((resolve2, reject2) => {
                        const blob = {};
                        blob.name = category.name;
                        blob.description = category.description;
                        if (category.parent) {
                          blob.parent = category.parent;
                        }
                        encryption
                          .encrypt(blob)
                          .then(json2 => {
                            category.blob = json2;
                            delete category.name;
                            delete category.description;
                            delete category.parent;
                            resolve2();
                          })
                          .catch(reject2);
                      })
                    );
                  });
                  // all local are encrypted
                  Promise.all(encrypt_all)
                    .then(() => {
                      axios({
                        url: url + "/api/v1/categories",
                        method: "POST",
                        headers: {
                          Authorization: "Token " + token
                        },
                        data: categories
                      })
                        .then(response => {
                          const local_promises = [];

                          response.data.forEach(category => {
                            local_promises.push(
                              new Promise((resolve3, reject3) => {
                                const old_category = categories.find(
                                  c => c.blob && c.blob === category.blob
                                );
                                encryption
                                  .decrypt(category.blob)
                                  .then(json2 => {
                                    delete category.blob;

                                    category = Object.assign(
                                      {},
                                      category,
                                      json2
                                    );

                                    storage
                                      .connectIndexedDB()
                                      .then(connection => {
                                        connection
                                          .transaction(
                                            "categories",
                                            "readwrite"
                                          )
                                          .objectStore("categories")
                                          .add(category);
                                      });

                                    // Update categories parent refrence with new category id
                                    json.categories.forEach(c2 => {
                                      if (c2.parent == old_category.id) {
                                        c2.parent = category.id;
                                      }
                                    });

                                    // Update transaction reference with new cateogry id
                                    json.transactions.forEach(transaction => {
                                      if (
                                        transaction.category === old_category.id
                                      ) {
                                        transaction.category = category.id;
                                      }
                                    });
                                    recursiveCategoryImport(category.id)
                                      .then(resolve3)
                                      .catch(reject3);
                                  })
                                  .catch(reject3);
                              })
                            );
                          });
                          Promise.all(local_promises)
                            .then(resolve)
                            .catch(reject);
                        })
                        .catch(reject);
                    })
                    .catch(reject);
                }
              });
            }

            return recursiveCategoryImport();
          })
          .then(res => {
            return new Promise((resolve, reject) => {
              let promises = [];
              let changes = [];

              json.changes.forEach(change => {
                // Create a promise to encrypt data
                promises.push(
                  new Promise((resolve, reject) => {
                    const blob = {};

                    blob.name = change.name;
                    if (typeof change.date == "string") {
                      blob.date = change.date.slice(0, 10);
                    } else if (
                      typeof change.date == "object" &&
                      change.date instanceof Date
                    ) {
                      blob.date = change.date.toISOString().slice(0, 10);
                    } else {
                      console.error(typeof change.date, change.date);
                    }
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
                        reject(exception);
                      });
                  })
                );
              });

              Promise.all(promises)
                .then(_ => {
                  axios({
                    url: url + "/api/v1/changes",
                    method: "POST",
                    headers: {
                      Authorization: "Token " + token
                    },
                    data: changes
                  }).then(response => {
                    changes = response.data;
                    promises = [];

                    changes.forEach(change => {
                      promises.push(
                        new Promise((resolve, reject) => {
                          encryption.decrypt(change.blob).then(json => {
                            delete change.blob;

                            change = Object.assign({}, change, json);
                            change.date = new Date(change.date);

                            storage
                              .connectIndexedDB()
                              .then(connection => {
                                connection
                                  .transaction("changes", "readwrite")
                                  .objectStore("changes")
                                  .put(change);

                                resolve();
                              })
                              .catch(exception => {
                                reject();
                              });
                          });
                        })
                      );
                    });

                    Promise.all(promises)
                      .then(_ => {
                        resolve();
                      })
                      .catch(exception => {
                        reject(exception);
                      });
                  });
                })
                .catch(exception => {
                  reject(exception);
                });
            });
          })
          .then(() => {
            return new Promise((resolve, reject) => {
              let promises = [];
              let transactions = [];

              json.transactions.forEach(transaction => {
                // Create a promise to encrypt data
                promises.push(
                  new Promise((resolve, reject) => {
                    const blob = {};

                    blob.name = transaction.name;
                    const { date } = transaction;
                    if (typeof date == "string") {
                      blob.date = date.slice(0, 10);
                    } else if (
                      typeof date == "object" &&
                      date instanceof Date
                    ) {
                      blob.date = date.toISOString().slice(0, 10);
                    } else {
                      console.error(typeof date, date);
                    }
                    blob.local_amount = transaction.local_amount;
                    blob.local_currency = transaction.local_currency;

                    encryption
                      .encrypt(blob)
                      .then(json => {
                        transaction.blob = json;

                        delete transaction.name;
                        delete transaction.date;
                        delete transaction.local_amount;
                        delete transaction.local_currency;

                        transactions.push(transaction);

                        resolve();
                      })
                      .catch(exception => {
                        reject(exception);
                      });
                  })
                );
              });

              Promise.all(promises)
                .then(_ => {
                  axios({
                    url: url + "/api/v1/debitscredits",
                    method: "POST",
                    headers: {
                      Authorization: "Token " + token
                    },
                    data: transactions
                  }).then(response => {
                    transactions = response.data;
                    promises = [];

                    transactions.forEach(transaction => {
                      promises.push(
                        new Promise((resolve, reject) => {
                          encryption.decrypt(transaction.blob).then(json => {
                            delete transaction.blob;

                            transaction = Object.assign({}, transaction, json);

                            storage
                              .connectIndexedDB()
                              .then(connection => {
                                connection
                                  .transaction("transactions", "readwrite")
                                  .objectStore("transactions")
                                  .put(transaction);

                                resolve();
                              })
                              .catch(exception => {
                                reject();
                              });
                          });
                        })
                      );
                    });

                    Promise.all(promises)
                      .then(_ => {
                        resolve();
                      })
                      .catch(exception => {
                        reject(exception);
                      });
                  });
                })
                .catch(exception => {
                  reject(exception);
                });
            });
          })
          .then(() => {
            // ACCOUNTS_IMPORT signal successfull import
            postMessage({
              uuid,
              type: ACCOUNTS_IMPORT,
              account: json.account
            });
          })
          .catch(exception => {
            console.error(exception);
            postMessage({
              uuid,
              type: ACCOUNTS_IMPORT,
              exception
            });
          });
      });
      break;
    }
    case ENCRYPTION_KEY_CHANGED:
      const { url, token, newCipher, oldCipher } = action;

      axios({
        url: url + "/api/v1/accounts",
        method: "get",
        headers: {
          Authorization: "Token " + token
        }
      })
        .then(function(response) {
          let promises = [];
          const accounts = [];

          encryption.key(oldCipher).then(() => {
            response.data.forEach(account => {
              if (account.preferences) {
                promises.push(
                  new Promise((resolve, reject) => {
                    encryption
                      .decrypt(
                        account.preferences === "" ? "{}" : account.preferences
                      )
                      .then(json => {
                        delete account.preferences;
                        accounts.push({
                          id: account.id,
                          preferences: json
                        });
                        resolve();
                      });
                  })
                );
              }
            });

            Promise.all(promises)
              .then(() => {
                promises = [];
                encryption.key(newCipher).then(() => {
                  accounts.forEach(account => {
                    promises.push(
                      new Promise((resolve, reject) => {
                        encryption
                          .encrypt(
                            account.preferences === ""
                              ? "{}"
                              : account.preferences
                          )
                          .then(json => {
                            account.preferences = json;
                            resolve();
                          });
                      })
                    );
                  });

                  Promise.all(promises)
                    .then(_ => {
                      axios({
                        url: url + "/api/v1/accounts",
                        method: "PATCH",
                        headers: {
                          Authorization: "Token " + token
                        },
                        data: accounts
                      })
                        .then(response => {
                          postMessage({
                            uuid,
                            type: action.type
                          });
                        })
                        .catch(exception => {
                          postMessage({
                            uuid,
                            type: action.type,
                            exception
                          });
                        });
                    })
                    .catch(exception => {
                      postMessage({
                        uuid,
                        type: action.type,
                        exception
                      });
                    });
                });
              })
              .catch(exception => {
                postMessage({
                  uuid,
                  type: action.type,
                  exception
                });
              });
          });
        })
        .catch(exception => {
          postMessage({
            uuid,
            type: action.type,
            exception
          });
        });
      break;
    default:
      return;
  }
};
