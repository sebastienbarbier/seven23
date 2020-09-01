import { dateToString, stringToDate } from "./date";
import { DB_NAME, DB_VERSION } from "../constants";
import storage from "../storage";

var firstRating = {};

/*
Return a list of changes, based on accountId.
Each change include the change details, 'rates' and 'secondDegree' for each Transactions based on
previous changes (which is why it's called a chain).
FirstRating is filled at each first new rate to complete before first rate transaction.
 */
function getChangeChain(accountId) {
  return new Promise((resolve, reject) => {
    var chain = [];
    var lastItem = {};
    var changes = [];

    storage.connectIndexedDB().then((connection) => {
      var index = connection
        .transaction("changes")
        .objectStore("changes")
        .index("account");

      var keyRange = IDBKeyRange.only(accountId);
      let cursor = index.openCursor(keyRange);

      cursor.onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
          let change = event.target.result.value;
          // We calculate exchange_rate which is no longer provided by API
          // change.date = stringToDate(change.date);
          change.exchange_rate =
            parseFloat(change.new_amount) / parseFloat(change.local_amount);
          changes.push(change);
          cursor.continue();
        } else {
          changes = changes.sort((a, b) => {
            return a.date > b.date ? 1 : -1;
          });

          for (var i in changes) {
            var item = Object.assign(
              {},
              {
                id: changes[i].id,
                account: changes[i].account,
                name: changes[i].name,
                local_amount: changes[i].local_amount,
                local_currency: changes[i].local_currency,
                new_amount: changes[i].new_amount,
                new_currency: changes[i].new_currency,
                date: changes[i].date,
                rates: Object.assign({}, lastItem.rates),
                secondDegree: Object.assign({}, lastItem.secondDegree),
              }
            );

            // GENERATE FIRST RATING
            // If first time using this localCurrency
            if (item.rates[changes[i]["local_currency"]] === undefined) {
              firstRating[changes[i]["local_currency"]] = {};
            }
            if (
              firstRating[changes[i]["local_currency"]][
                changes[i]["new_currency"]
              ] === undefined
            ) {
              firstRating[changes[i]["local_currency"]][
                changes[i]["new_currency"]
              ] = changes[i]["exchange_rate"];
            }

            // If first time using this new Currency
            if (item.rates[changes[i]["new_currency"]] === undefined) {
              firstRating[changes[i]["new_currency"]] = {};
            }
            if (
              firstRating[changes[i]["new_currency"]][
                changes[i]["local_currency"]
              ] === undefined
            ) {
              firstRating[changes[i]["new_currency"]][
                changes[i]["local_currency"]
              ] = 1 / changes[i]["exchange_rate"];
            }

            // GENERERATE CHAIN ITEM
            item.rates[changes[i]["local_currency"]] = Object.assign(
              {},
              item.rates[changes[i]["local_currency"]]
            );
            item.rates[changes[i]["local_currency"]][
              changes[i]["new_currency"]
            ] = changes[i]["exchange_rate"];

            item.rates[changes[i]["new_currency"]] = Object.assign(
              {},
              item.rates[changes[i]["new_currency"]]
            );
            item.rates[changes[i]["new_currency"]][
              changes[i]["local_currency"]
            ] = 1 / changes[i]["exchange_rate"];

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
            Object.keys(item.rates[changes[i]["local_currency"]]).forEach(
              (key) => {
                const value = item.rates[changes[i]["local_currency"]][key];
                if (key !== changes[i]["new_currency"]) {
                  item.rates[key];

                  // We need to update secondDegree with this new value
                  if (item.secondDegree[key] === undefined) {
                    item.secondDegree[key] = {};
                  }
                  item.secondDegree[key][changes[i]["new_currency"]] =
                    changes[i]["exchange_rate"] / value;

                  if (
                    item.secondDegree[changes[i]["new_currency"]] === undefined
                  ) {
                    item.secondDegree[changes[i]["new_currency"]] = {};
                  }
                  item.secondDegree[changes[i]["new_currency"]][key] =
                    1 / (changes[i]["exchange_rate"] / value);

                  // We also need to update firstRate with this new value
                  if (firstRating[key] === undefined) {
                    firstRating[key] = {};
                  }
                  if (
                    firstRating[key][changes[i]["new_currency"]] === undefined
                  ) {
                    firstRating[key][changes[i]["new_currency"]] =
                      changes[i]["exchange_rate"] / value;
                  }

                  if (firstRating[changes[i]["new_currency"]] === undefined) {
                    firstRating[changes[i]["new_currency"]] = {};
                  }
                  if (
                    firstRating[changes[i]["new_currency"]][key] === undefined
                  ) {
                    firstRating[changes[i]["new_currency"]][key] =
                      1 / (changes[i]["exchange_rate"] / value);
                  }
                }
              }
            );

            chain.push(item);
            lastItem = item;
          }

          chain = chain.sort((a, b) => {
            return a.date < b.date ? 1 : -1;
          });

          resolve(chain);
        }
      };
    });
  });
}

export { firstRating, getChangeChain };
