import {
  CATEGORIES_READ_REQUEST,
  CATEGORIES_EXPORT,
  ENCRYPTION_KEY_CHANGED,
  FLUSH,
  DB_NAME,
  DB_VERSION
} from "../constants";
import axios from "axios";
import storage from "../storage";
import encryption from "../encryption";

function generateBlob(category) {
  const blob = {};
  blob.name = category.name;
  if (category.parent === null) {
    delete category.parent;
  } else {
    blob.parent = category.parent;
  }
  return blob;
}

function recursiveGrowTree(list, category) {
  let children = list
    .filter(item => {
      return item.parent === category.id;
    })
    .sort((a, b) => {
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
    });

  if (children) {
    children.forEach(item => {
      item.children = recursiveGrowTree(list, item);
    });
    return children;
  } else {
    return null;
  }
}

onmessage = function(event) {
  // Action object is the on generated in action object
  const action = event.data;
  const { uuid } = action;

  switch (action.type) {
    case CATEGORIES_EXPORT: {
      const categories = [];

      storage.connectIndexedDB().then(connection => {
        let index = null; // criteria
        let keyRange = null; // values

        index = connection
          .transaction("categories")
          .objectStore("categories")
          .index("account");

        keyRange = IDBKeyRange.only(action.account);
        let cursor = index.openCursor(keyRange);
        cursor.onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
            const category = event.target.result.value;
            delete category.account;
            categories.push(category);
            cursor.continue();
          } else {
            postMessage({
              uuid,
              type: CATEGORIES_EXPORT,
              categories: categories
            });
          }
        };
      });

      break;
    }

    case CATEGORIES_READ_REQUEST: {
      let categoriesList = []; // Set object of Transaction
      let categoriesTree = []; // Set object of Transaction

      storage.connectIndexedDB().then(connection => {
        let index = null; // criteria

        if (action.id) {
          index = connection
            .transaction("categories")
            .objectStore("categories")
            .get(action.id);
          index.onsuccess = event => {
            postMessage({
              uuid,
              type: action.type,
              category: index.result
            });
          };
        } else {
          let keyRange = null; // values

          index = connection
            .transaction("categories")
            .objectStore("categories")
            .index("account");

          keyRange = IDBKeyRange.only(action.account);

          const ids = [];
          let cursor = index.openCursor(keyRange);
          cursor.onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
              const category = event.target.result.value;
              if (!category.parent || category.parent === category.id) {
                category.parent = null;
              }
              ids.push(category.id);
              categoriesList.push(category);
              cursor.continue();
            } else {
              // If parent does not exit (has been deleted), we move this category to root
              categoriesList.forEach(c => {
                if (ids.indexOf(c.parent) === -1) {
                  c.parent = null;
                }
              });

              // We generate children field in tree
              categoriesTree = categoriesList
                .filter(category => {
                  return !category.parent;
                })
                .sort((a, b) => {
                  return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
                });

              categoriesTree.forEach(category => {
                category.children = recursiveGrowTree(categoriesList, category);
              });

              // Sort List
              categoriesList = categoriesList.sort((a, b) => {
                return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
              });
              postMessage({
                uuid,
                type: action.type,
                categoriesList: categoriesList,
                categoriesTree: categoriesTree
              });
            }
          };
        }
      });

      break;
    }

    case FLUSH: {
      const { accounts } = action;
      if (accounts) {
        // For each account, we select all transaction, and delete them one by one.
        accounts.forEach(account => {
          storage.connectIndexedDB().then(connection => {
            var customerObjectStore = connection
              .transaction("categories", "readwrite")
              .objectStore("categories")
              .index("account")
              .openCursor(IDBKeyRange.only(account));

            customerObjectStore.onsuccess = function(event) {
              var cursor = event.target.result;
              // If cursor.continue() still have data to parse.
              if (cursor) {
                cursor.delete();
                cursor.continue();
              }
            };
          });
        });
        postMessage({
          uuid
        });
      } else {
        storage.connectIndexedDB().then(connection => {
          var customerObjectStore = connection
            .transaction("categories", "readwrite")
            .objectStore("categories");

          customerObjectStore.clear();
        });
        postMessage({
          uuid
        });
      }
      break;
    }
    case ENCRYPTION_KEY_CHANGED: {
      const { url, token, newCipher, oldCipher } = action;

      axios({
        url: url + "/api/v1/categories",
        method: "get",
        headers: {
          Authorization: "Token " + token
        }
      })
        .then(function(response) {
          let promises = [];
          const categories = [];

          encryption.key(oldCipher).then(() => {
            response.data.forEach(category => {
              promises.push(
                new Promise((resolve, reject) => {
                  encryption
                    .decrypt(category.blob === "" ? "{}" : category.blob)
                    .then(json => {
                      delete category.blob;
                      categories.push({
                        id: category.id,
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
                  categories.forEach(category => {
                    promises.push(
                      new Promise((resolve, reject) => {
                        encryption.encrypt(category.blob).then(json => {
                          category.blob = json;
                          resolve();
                        });
                      })
                    );
                  });

                  Promise.all(promises)
                    .then(_ => {
                      axios({
                        url: url + "/api/v1/categories",
                        method: "PATCH",
                        headers: {
                          Authorization: "Token " + token
                        },
                        data: categories
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
    }
    default:
      return;
  }
};
