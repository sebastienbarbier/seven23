import {
  CHANGES_READ_REQUEST,
  CHANGES_EXPORT,
  ENCRYPTION_KEY_CHANGED,
  UPDATE_ENCRYPTION,
  DB_NAME,
  DB_VERSION,
  FLUSH
} from "../constants";
import axios from "axios";
import encryption from "../encryption";

import { getChangeChain } from "./utils/changeChain";

function generateBlob(change) {
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
    case CHANGES_READ_REQUEST: {
      let index = null; // criteria
      let keyRange = null; // values
      let changes = []; // Set object of Transaction

      let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
      connectDB.onsuccess = function(event) {
        if (action.id) {
          console.error("Retrieve change from id not implemented");
        } else {
          index = event.target.result
            .transaction("changes")
            .objectStore("changes")
            .index("account");
          keyRange = IDBKeyRange.only(action.account);
          let cursor = index.openCursor(keyRange);
          cursor.onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
              changes.push(event.target.result.value);
              cursor.continue();
            } else {
              changes.forEach(change => {
                change.date = new Date(change.date);
              });

              changes = changes.sort((a, b) => {
                return a.date > b.date ? -1 : 1;
              });
              getChangeChain(action.account).then(chain => {
                postMessage({
                  type: action.type,
                  changes: changes,
                  chain: chain
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
    case CHANGES_EXPORT: {
      let index = null; // criteria
      let keyRange = null; // values
      let changes = []; // Set object of Transaction

      let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
      connectDB.onsuccess = function(event) {
        index = event.target.result
          .transaction("changes")
          .objectStore("changes")
          .index("account");
        keyRange = IDBKeyRange.only(action.account);
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
            .transaction("changes", "readwrite")
            .objectStore("changes")
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
                    encryption
                      .encrypt(result.value[1].blob)
                      .then(json => {
                        result.value[1].blob = json;
                        result = iterator.next();
                        iterate();
                      })
                      .catch(error => {
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
                  url: action.url + "/api/v1/changes",
                  method: "PATCH",
                  headers: {
                    Authorization: "Token " + action.token
                  },
                  data: changes
                })
                  .then(response => {
                    postMessage({
                      type: action.type
                    });
                  })
                  .catch(exception => {
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
          .transaction("changes", "readwrite")
          .objectStore("changes");

        customerObjectStore.clear();
      };
      break;
    }
    case ENCRYPTION_KEY_CHANGED: {
      const { url, token, newCipher, oldCipher } = action;

      axios({
        url: url + "/api/v1/changes",
        method: "get",
        headers: {
          Authorization: "Token " + token
        }
      })
        .then(function(response) {
          let promises = [];
          const changes = [];

          encryption.key(oldCipher).then(() => {
            response.data.forEach(change => {
              promises.push(
                new Promise((resolve, reject) => {
                  encryption
                    .decrypt(change.blob === "" ? "{}" : change.blob)
                    .then(json => {
                      delete change.blob;
                      changes.push({
                        id: change.id,
                        blob: json
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
                  changes.forEach(change => {
                    promises.push(
                      new Promise((resolve, reject) => {
                        encryption.encrypt(change.blob).then(json => {
                          change.blob = json;
                          resolve();
                        });
                      })
                    );
                  });

                  Promise.all(promises)
                    .then(_ => {
                      axios({
                        url: url + "/api/v1/changes",
                        method: "PATCH",
                        headers: {
                          Authorization: "Token " + token
                        },
                        data: changes
                      })
                        .then(response => {
                          postMessage({
                            type: action.type
                          });
                        })
                        .catch(exception => {
                          postMessage({
                            type: action.type,
                            exception
                          });
                        });
                    })
                    .catch(exception => {
                      postMessage({
                        type: action.type,
                        exception
                      });
                    });
                });
              })
              .catch(exception => {
                postMessage({
                  type: action.type,
                  exception
                });
              });
          });
        })
        .catch(exception => {
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
