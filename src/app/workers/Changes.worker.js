import {
  CHANGES_CREATE_REQUEST,
  CHANGES_READ_REQUEST,
  CHANGES_UPDATE_REQUEST,
  CHANGES_DELETE_REQUEST,
  CHANGES_EXPORT,
  UPDATE_ENCRYPTION,
  DB_NAME,
  DB_VERSION,
} from '../constants';
import axios from 'axios';
import encryption from '../encryption';

var firstRating = {};

function generateBlob (change) {
  const blob = {};

  blob.name = change.name;
  blob.date = change.date;
  blob.local_amount = change.local_amount;
  blob.local_currency = change.local_currency;
  blob.new_amount = change.new_amount;
  blob.new_currency = change.new_currency;

  return blob;
}

onmessage = function(event) {
  // Action object is the on generated in action object
  const action = event.data;

  switch (action.type) {
  case CHANGES_CREATE_REQUEST:
    break;
  case CHANGES_READ_REQUEST: {
    let index = null; // criteria
    let keyRange = null; // values
    let changes = []; // Set object of Transaction

    let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
    connectDB.onsuccess = function(event) {
      if (action.id) {
        console.error('Retrieve change from id not implemented');
      } else {
        index = event.target.result
          .transaction('changes')
          .objectStore('changes')
          .index('account');
        keyRange = IDBKeyRange.only(parseInt(action.account));
        let cursor = index.openCursor(keyRange);
        cursor.onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
            changes.push(event.target.result.value);
            cursor.continue();
          } else {

            changes.forEach((change) => {
              change.date = new Date(change.date);
            });

            changes = changes.sort((a, b) => {
              return a.date > b.date ? -1 : 1;
            });
            getChangeChain(parseInt(action.account)).then(chain => {
              postMessage({
                type: action.type,
                changes: changes,
                chain: chain,
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
  case CHANGES_UPDATE_REQUEST:
    break;
  case CHANGES_DELETE_REQUEST:
    break;
  case CHANGES_EXPORT: {
    let index = null; // criteria
    let keyRange = null; // values
    let changes = []; // Set object of Transaction

    let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
    connectDB.onsuccess = function(event) {
      index = event.target.result
        .transaction('changes')
        .objectStore('changes')
        .index('account');
      keyRange = IDBKeyRange.only(parseInt(action.account));
      let cursor = index.openCursor(keyRange);
      cursor.onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          // Clear generated data
          const change = event.target.result.value;
          delete change.account;
          delete change.category;
          delete change.exchange_rate;
          delete change.last_edited;
          delete change.year;
          delete change.month;
          delete change.day;
          changes.push(change);
          cursor.continue();
        } else {
          postMessage({
            type: CHANGES_EXPORT,
            changes: changes
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
          .transaction('changes', 'readwrite')
          .objectStore('changes')
          .openCursor();

        var changes = [];
        customerObjectStore.onsuccess = function(event) {

          var cursor = event.target.result;
          // If cursor.continue() still have data to parse.
          if (cursor) {
            const change = cursor.value;

            changes.push({ id: change.id, blob: generateBlob(change) });
            cursor.continue();
          } else {

            var iterator = changes.entries();

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
                url: action.url + '/api/v1/changes',
                method: 'PATCH',
                headers: {
                  Authorization: 'Token ' + action.token,
                },
                data: changes,
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