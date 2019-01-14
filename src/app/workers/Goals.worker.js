import {
  GOALS_CREATE_REQUEST,
  GOALS_READ_REQUEST,
  GOALS_UPDATE_REQUEST,
  GOALS_DELETE_REQUEST,
  GOALS_EXPORT,
  ENCRYPTION_KEY_CHANGED,
  UPDATE_ENCRYPTION,
  DB_NAME,
  DB_VERSION,
  FLUSH,
} from '../constants';
import axios from 'axios';
import encryption from '../encryption';

var firstRating = {};

function generateBlob (goal) {
  const blob = {};

  blob.type = goal.type;
  blob.amount = goal.amount;
  blob.currency = goal.currency;
  blob.category = goal.category;

  return blob;
}

onmessage = function(event) {
  // Action object is the on generated in action object
  const action = event.data;

  switch (action.type) {
  case GOALS_CREATE_REQUEST:
    break;
  case GOALS_READ_REQUEST: {
    let index = null; // criteria
    let keyRange = null; // values
    let goals = []; // Set object of Transaction

    let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
    connectDB.onsuccess = function(event) {
      if (action.id) {
        console.error('Retrieve goal from id not implemented');
      } else {
        index = event.target.result
          .transaction('goals')
          .objectStore('goals')
          .index('account');
        keyRange = IDBKeyRange.only(parseInt(action.account));
        let cursor = index.openCursor(keyRange);
        cursor.onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
            goals.push(event.target.result.value);
            cursor.continue();
          } else {

            getChangeChain(parseInt(action.account)).then(chain => {

              goals.forEach((goal) => {
                goal.original_amount = goal.amount;
                if (action.selectedCurrency != goal.currency) {
                  goal.amount = parseFloat(goal.amount) * chain[0].rates[goal.currency][action.selectedCurrency];
                }
              });

              // Todo, transform based on goals.currency
              postMessage({
                type: action.type,
                goals: goals,
              });
            });
          }
        };
      }
    };
    connectDB.onerror = function(event) {
      console.error(event);
    };
    break;
  }
  case GOALS_UPDATE_REQUEST:
    break;
  case GOALS_DELETE_REQUEST:
    break;
  case GOALS_EXPORT: {
    let index = null; // criteria
    let keyRange = null; // values
    let goals = []; // Set object of Transaction

    let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
    connectDB.onsuccess = function(event) {
      index = event.target.result
        .transaction('goals')
        .objectStore('goals')
        .index('account');
      keyRange = IDBKeyRange.only(parseInt(action.account));
      let cursor = index.openCursor(keyRange);
      cursor.onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          // Clear generated data
          const goal = event.target.result.value;
          delete goal.account;
          delete goal.last_edited;
          goals.push(goal);
          cursor.continue();
        } else {
          postMessage({
            type: GOALS_EXPORT,
            goals: goals
          });
        }
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
          .transaction('goals', 'readwrite')
          .objectStore('goals')
          .openCursor();

        var goals = [];
        customerObjectStore.onsuccess = function(event) {

          var cursor = event.target.result;
          // If cursor.continue() still have data to parse.
          if (cursor) {
            const goal = cursor.value;

            goals.push({ id: goal.id, blob: generateBlob(goal) });
            cursor.continue();
          } else {

            var iterator = goals.entries();

            let result = iterator.next();

            const promise = new Promise((resolve, reject) => {

              var iterate = () => {
                if (!result.done) {
                  // console.log(result.value[1].id); // 1 3 5 7 9
                  encryption.encrypt(result.value[1].blob).then((json) => {
                    result.value[1].blob = json;
                    result = iterator.next();
                    iterate();
                  }).catch((error) => {
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
                url: action.url + '/api/v1/goals',
                method: 'PATCH',
                headers: {
                  Authorization: 'Token ' + action.token,
                },
                data: goals,
              })
                .then(response => {
                  postMessage({
                    type: action.type,
                  });
                }).catch(exception => {
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
    var connectDB = indexedDB.open(DB_NAME, DB_VERSION);
    connectDB.onsuccess = function(event) {
      var customerObjectStore = event.target.result
        .transaction('goals', 'readwrite')
        .objectStore('goals');

      customerObjectStore.clear();
    };
    break;
  }
  case ENCRYPTION_KEY_CHANGED: {
    const { url, token, newCipher, oldCipher } = action;

    axios({
      url: url + '/api/v1/goals',
      method: 'get',
      headers: {
        Authorization: 'Token ' + token,
      },
    })
      .then(function(response) {
        let promises = [];
        const goals = [];

        encryption.key(oldCipher).then(() => {

          response.data.forEach(goal => {
            promises.push(new Promise((resolve, reject) => {
              encryption.decrypt(goal.blob === '' ? '{}' : goal.blob).then((json) => {
                delete goal.blob;
                goals.push({
                  id: goal.id,
                  blob: json
                });
                resolve();
              });
            }));
          });

          Promise.all(promises).then(() => {
            promises = [];
            encryption.key(newCipher).then(() => {
              goals.forEach(goal => {
                promises.push(new Promise((resolve, reject) => {
                  encryption.encrypt(goal.blob).then((json) => {
                    goal.blob = json;
                    resolve();
                  });
                }));
              });

              Promise.all(promises).then(_ => {
                axios({
                  url: url + '/api/v1/goals',
                  method: 'PATCH',
                  headers: {
                    Authorization: 'Token ' + token,
                  },
                  data: goals,
                })
                  .then(response => {
                    postMessage({
                      type: action.type,
                    });
                  }).catch(exception => {
                    postMessage({
                      type: action.type,
                      exception
                    });
                  });
              }).catch(exception => {
                postMessage({
                  type: action.type,
                  exception
                });
              });
            });
          }).catch(exception => {
            postMessage({
              type: action.type,
              exception
            });
          });
        });
      }).catch(exception => {
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

// Duplicate in Transactions worker
function getChangeChain(accountId) {
  return new Promise((resolve, reject) => {
    var chain = [];
    var lastItem = {};
    var changes = [];

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
          let change = event.target.result.value;
          // We calculate exchange_rate which is no longer provided by API
          change.exchange_rate = parseFloat(change.new_amount) / parseFloat(change.local_amount);
          changes.push(change);
          cursor.continue();
        } else {

          changes = changes.sort((a, b) => {
            return a.date > b.date ? 1 : -1;
          });

          for (var i in changes) {
            var item = Object.assign({}, {
              id: changes[i].id,
              account: changes[i].account,
              name: changes[i].name,
              local_amount: changes[i].local_amount,
              local_currency: changes[i].local_currency,
              new_amount: changes[i].new_amount,
              new_currency: changes[i].new_currency,
              date: new Date(changes[i].date),
              rates: Object.assign({}, lastItem.rates),
              secondDegree: Object.assign({}, lastItem.secondDegree),
            });

            // GENERATE FIRST RATING
            // If first time using this localCurrency
            if (item.rates[changes[i]['local_currency']] === undefined) {
              firstRating[changes[i]['local_currency']] = {};
            }
            if (
              firstRating[changes[i]['local_currency']][changes[i]['new_currency']] === undefined
            ) {
              firstRating[changes[i]['local_currency']][changes[i]['new_currency']] = changes[i]['exchange_rate'];
            }

            // If first time using this new Currency
            if (item.rates[changes[i]['new_currency']] === undefined) {
              firstRating[changes[i]['new_currency']] = {};
            }
            if (
              firstRating[changes[i]['new_currency']][changes[i]['local_currency']] === undefined
            ) {
              firstRating[changes[i]['new_currency']][changes[i]['local_currency']] = 1 / changes[i]['exchange_rate'];
            }

            // GENERERATE CHAIN ITEM
            item.rates[changes[i]['local_currency']] =
              Object.assign({}, item.rates[changes[i]['local_currency']]);
            item.rates[changes[i]['local_currency']][changes[i]['new_currency']] = changes[i]['exchange_rate'];

            item.rates[changes[i]['new_currency']] =
              Object.assign({}, item.rates[changes[i]['new_currency']]);
            item.rates[changes[i]['new_currency']][changes[i]['local_currency']] = 1 / changes[i]['exchange_rate'];

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
            Object.keys(item.rates[changes[i]['local_currency']])
              .forEach((key) => {
                const value = item.rates[changes[i]['local_currency']][key];
                if (key !== changes[i]['new_currency']) {
                  item.rates[key];
                  // console.log('local to key');
                  // console.log(changes[i]['local_currency'] + ' > ' + key + ' > ' + changes[i]['new_currency'] );
                  // console.log(changes[i]['local_currency'] + ' > ' + changes[i]['new_currency'] + ' : ' + changes[i]['exchange_rate'] );
                  // console.log(changes[i]['local_currency'] + ' > ' + key + ' : ' + item.rates.get(changes[i]['local_currency']).get(key) );
                  // console.log(key + ' > ' + changes[i]['new_currency'] + ' : ' + changes[i]['exchange_rate'] / value );
                  // console.log(changes[i]['new_currency'] + ' > ' + key + ' : ' + 1/(changes[i]['exchange_rate'] / value));

                  if (item.secondDegree[key] === undefined) {
                    item.secondDegree[key] = {};
                  }
                  item.secondDegree[key][changes[i]['new_currency']] = changes[i]['exchange_rate'] / value;

                  if (
                    item.secondDegree[changes[i]['new_currency']] === undefined
                  ) {
                    item.secondDegree[changes[i]['new_currency']] = {};
                  }
                  item.secondDegree[changes[i]['new_currency']][key] = 1 / (changes[i]['exchange_rate'] / value);

                  // We also need to update firstRate with this new value ... sad :(
                  if (firstRating[key] === undefined) {
                    firstRating[key] = {};
                  }
                  if (
                    firstRating[key][changes[i]['new_currency']] ===
                    undefined
                  ) {
                    firstRating[key][changes[i]['new_currency']] = changes[i]['exchange_rate'] / value;
                  }

                  if (
                    firstRating[changes[i]['new_currency']] === undefined
                  ) {
                    firstRating[changes[i]['new_currency']] = {};
                  }
                  if (
                    firstRating[changes[i]['new_currency']][key] ===
                    undefined
                  ) {
                    firstRating[changes[i]['new_currency']][key] = 1 / (changes[i]['exchange_rate'] / value);
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

          resolve(chain);
        }
      };
    }; // end connectDB.onsuccess
    connectDB.onerror = function(event) {
      console.error(event);
    };
  });
}