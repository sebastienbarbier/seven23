import {
  CHANGES_CREATE_REQUEST,
  CHANGES_READ_REQUEST,
  CHANGES_UPDATE_REQUEST,
  CHANGES_DELETE_REQUEST,
  CHANGES_EXPORT,
  DB_NAME,
  DB_VERSION,
} from '../constants';

var firstRating = new Map();

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
        index = event.target.result
          .transaction('changes')
          .objectStore('changes')
          .get(parseInt(action.id));
        index.onsuccess = event => {
          postMessage({
            type: action.type,
            change: index.result,
          });
        };
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
            var item = {
              id: changes[i].id,
              account: changes[i].account,
              date: new Date(changes[i].date),
              rates: new Map(lastItem.rates),
              secondDegree: new Map(lastItem.secondDegree),
            };

            // GENERATE FIRST RATING
            // If first time using this localCurrency
            if (item.rates.get(changes[i]['local_currency']) === undefined) {
              firstRating.set(changes[i]['local_currency'], new Map());
            }
            if (
              firstRating
                .get(changes[i]['local_currency'])
                .get(changes[i]['new_currency']) === undefined
            ) {
              firstRating
                .get(changes[i]['local_currency'])
                .set(changes[i]['new_currency'], changes[i]['exchange_rate']);
            }

            // If first time using this new Currency
            if (item.rates.get(changes[i]['new_currency']) === undefined) {
              firstRating.set(changes[i]['new_currency'], new Map());
            }
            if (
              firstRating
                .get(changes[i]['new_currency'])
                .get(changes[i]['local_currency']) === undefined
            ) {
              firstRating
                .get(changes[i]['new_currency'])
                .set(
                  changes[i]['local_currency'],
                  1 / changes[i]['exchange_rate'],
                );
            }

            // GENERERATE CHAIN ITEM
            item.rates.set(
              changes[i]['local_currency'],
              new Map(item.rates.get(changes[i]['local_currency'])),
            );
            item.rates
              .get(changes[i]['local_currency'])
              .set(changes[i]['new_currency'], changes[i]['exchange_rate']);

            item.rates.set(
              changes[i]['new_currency'],
              new Map(item.rates.get(changes[i]['new_currency'])),
            );
            item.rates
              .get(changes[i]['new_currency'])
              .set(
                changes[i]['local_currency'],
                1 / changes[i]['exchange_rate'],
              );

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
            item.rates
              .get(changes[i]['local_currency'])
              .forEach((value, key) => {
                if (key !== changes[i]['new_currency']) {
                  item.rates.get(key);
                  // console.log('local to key');
                  // console.log(changes[i]['local_currency'] + ' > ' + key + ' > ' + changes[i]['new_currency'] );
                  // console.log(changes[i]['local_currency'] + ' > ' + changes[i]['new_currency'] + ' : ' + changes[i]['exchange_rate'] );
                  // console.log(changes[i]['local_currency'] + ' > ' + key + ' : ' + item.rates.get(changes[i]['local_currency']).get(key) );
                  // console.log(key + ' > ' + changes[i]['new_currency'] + ' : ' + changes[i]['exchange_rate'] / value );
                  // console.log(changes[i]['new_currency'] + ' > ' + key + ' : ' + 1/(changes[i]['exchange_rate'] / value));

                  if (item.secondDegree.get(key) === undefined) {
                    item.secondDegree.set(key, new Map());
                  }
                  item.secondDegree
                    .get(key)
                    .set(
                      changes[i]['new_currency'],
                      changes[i]['exchange_rate'] / value,
                    );

                  if (
                    item.secondDegree.get(changes[i]['new_currency']) ===
                    undefined
                  ) {
                    item.secondDegree.set(
                      changes[i]['new_currency'],
                      new Map(),
                    );
                  }
                  item.secondDegree
                    .get(changes[i]['new_currency'])
                    .set(key, 1 / (changes[i]['exchange_rate'] / value));

                  // We also need to update firstRate with this new value ... sad :(
                  if (firstRating.get(key) === undefined) {
                    firstRating.set(key, new Map());
                  }
                  if (
                    firstRating.get(key).get(changes[i]['new_currency']) ===
                    undefined
                  ) {
                    firstRating
                      .get(key)
                      .set(
                        changes[i]['new_currency'],
                        changes[i]['exchange_rate'] / value,
                      );
                  }

                  if (
                    firstRating.get(changes[i]['new_currency']) === undefined
                  ) {
                    firstRating.set(changes[i]['new_currency'], new Map());
                  }
                  if (
                    firstRating.get(changes[i]['new_currency']).get(key) ===
                    undefined
                  ) {
                    firstRating
                      .get(changes[i]['new_currency'])
                      .set(key, 1 / (changes[i]['exchange_rate'] / value));
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
