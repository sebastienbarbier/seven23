import {
  CHANGES_READ_REQUEST,
  CHANGES_EXPORT,
  ENCRYPTION_KEY_CHANGED,
  DB_NAME,
  DB_VERSION,
  FLUSH,
} from "../constants";
import axios from "axios";
import encryption from "../encryption";
import storage from "../storage";

import { dateToString } from "../utils/date";
import { getChangeChain } from "../utils/change";

function generateBlob(change) {
  const blob = {};

  blob.name = change.name;
  blob.date = dateToString(change.date);
  blob.local_amount = change.local_amount;
  blob.local_currency = change.local_currency;
  blob.new_amount = change.new_amount;
  blob.new_currency = change.new_currency;

  return blob;
}

onmessage = function (event) {
  // Action object is the on generated in action object
  const action = event.data;
  const { uuid } = action;

  switch (action.type) {
    case CHANGES_READ_REQUEST: {
      let index = null; // criteria
      let keyRange = null; // values
      let changes = []; // Set object of Transaction

      storage.connectIndexedDB().then((connection) => {
        index = connection
          .transaction("changes")
          .objectStore("changes")
          .index("account");
        keyRange = IDBKeyRange.only(action.account);
        let cursor = index.openCursor(keyRange);
        cursor.onsuccess = function (event) {
          var cursor = event.target.result;
          if (cursor) {
            changes.push(event.target.result.value);
            cursor.continue();
          } else {
            changes = changes.sort((a, b) => {
              return a.date > b.date ? -1 : 1;
            });
            getChangeChain(action.account).then((chain) => {
              postMessage({
                uuid,
                type: action.type,
                changes: changes,
                chain: chain,
              });
            });
          }
        };
      });

      break;
    }
    case CHANGES_EXPORT: {
      let index = null; // criteria
      let keyRange = null; // values
      let changes = []; // Set object of Transaction

      storage.connectIndexedDB().then((connection) => {
        index = connection
          .transaction("changes")
          .objectStore("changes")
          .index("account");
        keyRange = IDBKeyRange.only(action.account);
        let cursor = index.openCursor(keyRange);
        cursor.onsuccess = function (event) {
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
              uuid,
              type: CHANGES_EXPORT,
              changes: changes,
            });
          }
        };
      });
      break;
    }
    case FLUSH: {
      const { accounts } = action;

      if (accounts) {
       if (accounts.length == 0) {
          postMessage({
            uuid,
          });
        } else {
          // For each account, we select all changes, and delete them one by one.
          accounts.forEach((account) => {
            storage.connectIndexedDB().then((connection) => {
              var customerObjectStore = connection
                .transaction("changes", "readwrite")
                .objectStore("changes")
                .index("account")
                .openCursor(IDBKeyRange.only(account));

              customerObjectStore.onsuccess = function (event) {
                var cursor = event.target.result;
                // If cursor.continue() still have data to parse.
                if (cursor) {
                  cursor.delete();
                  cursor.continue();
                } else {
                  postMessage({
                    uuid,
                  });
                }
              };
            });
          });
        }
      } else {
        storage.connectIndexedDB().then((connection) => {
          var customerObjectStore = connection
            .transaction("changes", "readwrite")
            .objectStore("changes");

          customerObjectStore.clear().onsuccess = (event) => {
            postMessage({
              uuid,
            });
          };
        });
      }
      break;
    }
    case ENCRYPTION_KEY_CHANGED: {
      const { url, token, newCipher, oldCipher } = action;

      axios({
        url: url + "/api/v1/changes",
        method: "get",
        headers: {
          Authorization: "Token " + token,
        },
      })
        .then(function (response) {
          let promises = [];
          const changes = [];

          encryption.key(oldCipher).then(() => {
            response.data.forEach((change) => {
              promises.push(
                new Promise((resolve, reject) => {
                  encryption
                    .decrypt(change.blob === "" ? "{}" : change.blob)
                    .then((json) => {
                      delete change.blob;
                      changes.push({
                        id: change.id,
                        blob: json,
                      });
                      resolve();
                    });
                })
              );
            });

            Promise.all(promises)
              .then(() => {
                promises = [];
                encryption.key(newCipher).then(() => {
                  changes.forEach((change) => {
                    promises.push(
                      new Promise((resolve, reject) => {
                        encryption.encrypt(change.blob).then((json) => {
                          change.blob = json;
                          resolve();
                        });
                      })
                    );
                  });

                  Promise.all(promises)
                    .then((_) => {
                      axios({
                        url: url + "/api/v1/changes",
                        method: "PATCH",
                        headers: {
                          Authorization: "Token " + token,
                        },
                        data: changes,
                      })
                        .then((response) => {
                          postMessage({
                            uuid,
                            type: action.type,
                          });
                        })
                        .catch((exception) => {
                          postMessage({
                            uuid,
                            type: action.type,
                            exception,
                          });
                        });
                    })
                    .catch((exception) => {
                      postMessage({
                        uuid,
                        type: action.type,
                        exception,
                      });
                    });
                });
              })
              .catch((exception) => {
                postMessage({
                  uuid,
                  type: action.type,
                  exception,
                });
              });
          });
        })
        .catch((exception) => {
          postMessage({
            uuid,
            type: action.type,
            exception,
          });
        });
      break;
    }
    default:
      return;
  }
};
