import axios from 'axios';

import storage from '../storage';

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
      json.categories.forEach((category) => { category.account = account.id; });

      steps = steps + 1;
      _updateProgress(steps, total);

      // UPDATE CATEGORIES
      function recursiveCategoryImport(categories, parent = null) {
        return new Promise((res, rej) => {
          const local_promises = [];
          json.categories.filter((category) => category.parent === parent).map((category) => {
            if (category.parent === null) {
              delete category.parent;
            }

            local_promises.push(new Promise((resolve, reject) => {
              axios({
                url: url + '/api/v1/categories',
                method: 'POST',
                headers: {
                  Authorization: 'Token ' + token,
                },
                data: category,
              })
              .then(response => {
                storage.connectIndexedDB().then(connection => {
                  connection
                    .transaction('categories', 'readwrite')
                    .objectStore('categories')
                    .add(response.data);
                  // Update categories parent refrence with new category id
                  json.categories.forEach((c2) => {
                    if (c2.parent === category.id) {
                      c2.parent = response.data.id;
                    }
                  });

                  // Update transaction reference with new cateogry id
                  json.transactions.forEach((transaction) => {
                    if (transaction.category === category.id) {
                      transaction.category = response.data.id;
                    }
                  });
                  steps = steps + 1;
                  _updateProgress(steps, total);
                  // Create children to category.
                  local_promises.push(recursiveCategoryImport(categories, response.data.id));
                  resolve();
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
        change.date = change.date.slice(0,10);
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

            response.data.date = new Date(response.data.date);
            storage.connectIndexedDB().then(connection => {
              connection
                .transaction('changes', 'readwrite')
                .objectStore('changes')
                .put(response.data);

              steps = steps + 1;
              _updateProgress(steps, total);
              resolve();
            });
          });
        }));
      });

      return Promise.all(promises);
    })
    .then(() => {
      const promises = [];

      return new Promise((resolve, reject) => {
        const transactions = json.transactions;

        function createTransaction(transaction) {
          const { date } = transaction;
          transaction.date = date.slice(0, 10);
          axios({
            url: url + '/api/v1/debitscredits',
            method: 'POST',
            headers: {
              Authorization: 'Token ' + token,
            },
            data: transaction,
          })
          .then(response => {
            // Populate data for indexedb indexes
            const year = response.data.date.slice(0, 4);
            const month = response.data.date.slice(5, 7);
            const day = response.data.date.slice(8, 10);
            response.data.date = new Date(year, month - 1, day, 0, 0, 0);

            storage.connectIndexedDB().then(connection => {
              connection
                .transaction('transactions', 'readwrite')
                .objectStore('transactions')
                .put(response.data);

              steps = steps + 1;
              _updateProgress(steps, total);

              if (!transactions.length) {
                resolve();
              } else {
                createTransaction(transactions.pop());
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
    break;
  }
  default:
    return;
  }
};
