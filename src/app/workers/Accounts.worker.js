import axios from 'axios';

import storage from '../storage';
import encryption from '../encryption';

import {
  ACCOUNTS_IMPORT,
  ACCOUNTS_IMPORT_UPDATE,
} from '../constants';

function _updateProgress(steps, total) {
  postMessage({
    type: ACCOUNTS_IMPORT_UPDATE,
    progress: steps * 100 / total,
  });
}

onmessage = function(event) {
  // Action object is the on generated in action object
  const action = event.data;

  switch (action.type) {
  case ACCOUNTS_IMPORT: {

    encryption.key(action.cipher).then(() => {

      const { json, token, url } = event.data;

      let steps = 0;
      const total = 1 + json.categories.length + json.transactions.length + json.changes.length;

      _updateProgress(steps, total);

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

          steps = steps + 1;
          _updateProgress(steps, total);

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

                    category.blob = json2;

                    delete category.name;
                    delete category.description;
                    delete category.parent;

                    axios({
                      url: url + '/api/v1/categories',
                      method: 'POST',
                      headers: {
                        Authorization: 'Token ' + token,
                      },
                      data: category,
                    })
                      .then(response => {

                        let obj = Object.assign({}, response.data, blob);
                        delete obj.blob;

                        storage.connectIndexedDB().then(connection => {
                          connection
                            .transaction('categories', 'readwrite')
                            .objectStore('categories')
                            .add(obj);

                          // Update categories parent refrence with new category id
                          json.categories.forEach((c2) => {
                            if (parseInt(c2.parent) === parseInt(category.id)) {
                              c2.parent = parseInt(obj.id);
                            }
                          });

                          // Update transaction reference with new cateogry id
                          json.transactions.forEach((transaction) => {
                            if (parseInt(transaction.category) === parseInt(category.id)) {
                              transaction.category = parseInt(obj.id);
                            }
                          });

                          steps = steps + 1;
                          _updateProgress(steps, total);
                          // Create children to category.
                          local_promises.push(recursiveCategoryImport(categories, obj.id));
                          resolve();
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
          const promises = [];

          json.changes.forEach((change) => {

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

              promises.push(new Promise((resolve, reject) => {
                axios({
                  url: url + '/api/v1/changes',
                  method: 'POST',
                  headers: {
                    Authorization: 'Token ' + token,
                  },
                  data: change,
                })
                  .then(response => {
                    let change = Object.assign({}, response.data, blob);
                    delete change.blob;
                    change.date = new Date(change.date);

                    storage.connectIndexedDB().then(connection => {
                      connection
                        .transaction('changes', 'readwrite')
                        .objectStore('changes')
                        .put(change);

                      steps = steps + 1;
                      _updateProgress(steps, total);
                      resolve();
                    });
                  });
              }));
            });
          });

          return Promise.all(promises);
        })
        .then(() => {

          return new Promise((resolve, reject) => {
            const transactions = json.transactions;

            function createTransaction(transaction) {

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

                axios({
                  url: url + '/api/v1/debitscredits',
                  method: 'POST',
                  headers: {
                    Authorization: 'Token ' + token,
                  },
                  data: transaction,
                })
                  .then(response => {
                    try {
                      let response_transaction = Object.assign({}, response.data, blob);
                      delete response_transaction.blob;

                      // Populate data for indexedb indexes
                      const year = response_transaction.date.slice(0, 4);
                      const month = response_transaction.date.slice(5, 7);
                      const day = response_transaction.date.slice(8, 10);
                      response_transaction.date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

                      storage.connectIndexedDB().then(connection => {
                        connection
                          .transaction('transactions', 'readwrite')
                          .objectStore('transactions')
                          .put(response_transaction);

                        steps = steps + 1;
                        _updateProgress(steps, total);

                        if (!transactions.length) {
                          resolve();
                        } else {
                          createTransaction(transactions.pop());
                        }
                      });
                    } catch (exception) {
                      console.error(exception);
                    }
                  });
              });
            }
            if (!transactions.length) {
              resolve();
            } else {
              createTransaction(transactions.pop());
            }
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
