import axios from 'axios';

import storage from '../storage';
import encryption from '../encryption';

import {
  ACCOUNTS_IMPORT,
} from '../constants';

function _updateProgress(total) {
  // postMessage({
  //   type: ACCOUNTS_IMPORT_UPDATE,
  //   total,
  // });
}

onmessage = function(event) {
  // Action object is the on generated in action object
  const action = event.data;

  switch (action.type) {
  case ACCOUNTS_IMPORT: {

    encryption.key(action.cipher).then(() => {

      const { json, token, url } = event.data;

      const total = 1 + json.categories.length + (json.transactions.length * 2) + (json.changes.length * 2);

      _updateProgress(total);

      delete json.account.id;

      axios({
        url: url + '/api/v1/accounts',
        method: 'POST',
        headers: {
          Authorization: 'Token ' + token,
        },
        data: json.account,
      })
        .then(response => {

          const account = response.data;
          json.account.id = account.id;

          // Update account reference from imported data
          json.transactions.forEach((transaction) => { transaction.account = account.id; });
          json.changes.forEach((change) => { change.account = account.id; });
          json.categories.forEach((category) => {
            category.account = account.id;
            if (!category.parent) {
              category.parent = null;
            }
          });

          _updateProgress(total);

          // UPDATE CATEGORIES
          function recursiveCategoryImport(categories, parent = null) {
            return new Promise((res, rej) => {

              const local_promises = [];
              json.categories.filter((category) => category.parent === parent).map((category) => {
                local_promises.push(new Promise((resolve, reject) => {

                  // Create blob
                  const blob = {};
                  blob.name = category.name;
                  blob.description = category.description;
                  if (category.parent) {
                    blob.parent = category.parent;
                  }

                  encryption.encrypt(blob).then((json2) => {

                    const old_category = Object.assign({}, category);

                    old_category.blob = json2;

                    delete old_category.name;
                    delete old_category.description;
                    delete old_category.parent;

                    axios({
                      url: url + '/api/v1/categories',
                      method: 'POST',
                      headers: {
                        Authorization: 'Token ' + token,
                      },
                      data: old_category,
                    })
                      .then(response => {

                        const new_category = Object.assign({}, response.data, blob);
                        delete new_category.blob;

                        storage.connectIndexedDB().then(connection => {
                          connection
                            .transaction('categories', 'readwrite')
                            .objectStore('categories')
                            .add(new_category);

                          // Update categories parent refrence with new category id
                          json.categories.forEach((c2) => {
                            if (parseInt(c2.parent) === parseInt(old_category.id)) {
                              c2.parent = parseInt(new_category.id);
                            }
                          });

                          // Update transaction reference with new cateogry id
                          json.transactions.forEach((transaction) => {
                            if (parseInt(transaction.category) === parseInt(old_category.id)) {
                              transaction.category = parseInt(new_category.id);
                            }
                          });

                          _updateProgress(total);
                          // Create children to category.
                          recursiveCategoryImport(categories, new_category.id).then(() => {
                            resolve();
                          }).catch(() => {
                            reject();
                          });
                        });
                      });
                  });
                }));
              });
              Promise.all(local_promises).then(() => {
                res();
              }).catch(() => {
                rej();
              });
            });
          }

          return recursiveCategoryImport(json.categories);
        })
        .then((res) => {

          return new Promise((resolve, reject) => {

            let promises = [];
            let changes = [];

            json.changes.forEach((change) => {
              // Create a promise to encrypt data
              promises.push(new Promise((resolve, reject) => {

                const blob = {};

                blob.name = change.name;
                blob.date = change.date.slice(0,10);
                blob.local_amount = change.local_amount;
                blob.local_currency = change.local_currency;
                blob.new_amount = change.new_amount;
                blob.new_currency = change.new_currency;

                encryption.encrypt(blob).then((json) => {
                  change.blob = json;

                  delete change.name;
                  delete change.date;
                  delete change.local_amount;
                  delete change.local_currency;
                  delete change.new_amount;
                  delete change.new_currency;

                  changes.push(change);

                  _updateProgress(total);

                  resolve();
                }).catch(exception => {
                  reject(exception);
                });

              }));
            });

            Promise.all(promises).then(_ => {
              axios({
                url: url + '/api/v1/changes',
                method: 'POST',
                headers: {
                  Authorization: 'Token ' + token,
                },
                data: changes,
              })
                .then(response => {

                  if (changes.length === 1) {
                    changes = [response.data];
                  } else {
                    changes = response.data;
                  }

                  promises = [];

                  changes.forEach((change) => {
                    promises.push(new Promise((resolve, reject) => {
                      encryption.decrypt(change.blob).then((json) => {

                        delete change.blob;

                        change = Object.assign({}, change, json);
                        change.date = new Date(change.date);

                        storage.connectIndexedDB().then(connection => {
                          connection
                            .transaction('changes', 'readwrite')
                            .objectStore('changes')
                            .put(change);

                          _updateProgress(total);
                          resolve();
                        }).catch(exception => {
                          reject();
                        });
                      });
                    }));
                  });

                  Promise.all(promises).then(_ => {
                    resolve();
                  }).catch(exception => {
                    reject(exception);
                  });
                });
            }).catch(exception => {
              reject(exception);
            });

          });
        })
        .then(() => {

          return new Promise((resolve, reject) => {

            let promises = [];
            let transactions = [];

            json.transactions.forEach((transaction) => {
              // Create a promise to encrypt data
              promises.push(new Promise((resolve, reject) => {
                const blob = {};

                blob.name = transaction.name;
                const { date } = transaction;
                blob.date = date.slice(0, 10);
                if (transaction.category) {
                  blob.category = transaction.category;
                }
                blob.local_amount = transaction.local_amount;
                blob.local_currency = transaction.local_currency;

                encryption.encrypt(blob).then((json) => {
                  transaction.blob = json;

                  delete transaction.name;
                  delete transaction.date;
                  delete transaction.category;
                  delete transaction.local_amount;
                  delete transaction.local_currency;

                  transactions.push(transaction);

                  _updateProgress(total);

                  resolve();
                }).catch(exception => {
                  reject(exception);
                });
              }));
            });

            Promise.all(promises).then(_ => {
              axios({
                url: url + '/api/v1/debitscredits',
                method: 'POST',
                headers: {
                  Authorization: 'Token ' + token,
                },
                data: transactions,
              })
                .then(response => {

                  if (transactions.length === 1) {
                    transactions = [response.data];
                  } else {
                    transactions = response.data;
                  }

                  promises = [];

                  transactions.forEach((transaction) => {
                    promises.push(new Promise((resolve, reject) => {
                      encryption.decrypt(transaction.blob).then((json) => {

                        delete transaction.blob;

                        transaction = Object.assign({}, transaction, json);

                        storage.connectIndexedDB().then(connection => {
                          connection
                            .transaction('transactions', 'readwrite')
                            .objectStore('transactions')
                            .put(transaction);

                          _updateProgress(total);
                          resolve();
                        }).catch(exception => {
                          reject();
                        });
                      });
                    }));
                  });

                  Promise.all(promises).then(_ => {
                    resolve();
                  }).catch(exception => {
                    reject(exception);
                  });
                });
            }).catch(exception => {
              reject(exception);
            });

          });
        })
        .then(() => {
          // ACCOUNTS_IMPORT signal successfull import
          postMessage({
            type: ACCOUNTS_IMPORT
          });
        })
        .catch(exception => {
          console.error(exception);
          if (exception.response.status !== 400) {
            console.error(exception);
          }
          postMessage({
            type: ACCOUNTS_IMPORT,
            exception,
          });
        });
    });
    break;
  }
  default:
    return;
  }
};