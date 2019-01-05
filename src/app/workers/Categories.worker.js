import {
  CATEGORIES_READ_REQUEST,
  CATEGORIES_EXPORT,
  UPDATE_ENCRYPTION,
  FLUSH,
  DB_NAME,
  DB_VERSION,
} from '../constants';
import axios from 'axios';
import encryption from '../encryption';

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

  switch (action.type) {

  case CATEGORIES_EXPORT: {
    const categories = [];

    let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
    connectDB.onsuccess = function(event) {

      let index = null; // criteria
      let keyRange = null; // values

      index = event.target.result
        .transaction('categories')
        .objectStore('categories')
        .index('account');

      keyRange = IDBKeyRange.only(parseInt(action.account));
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
            type: CATEGORIES_EXPORT,
            categories: categories
          });
        }
      };
    };
    connectDB.onerror = function(event) {
      console.error(event);
    };
    break;
  }

  case CATEGORIES_READ_REQUEST: {
    let categoriesList = []; // Set object of Transaction
    let categoriesTree = []; // Set object of Transaction

    let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
    connectDB.onsuccess = function(event) {
      let index = null; // criteria

      if (action.id) {
        index = event.target.result
          .transaction('categories')
          .objectStore('categories')
          .get(parseInt(action.id));
        index.onsuccess = event => {
          postMessage({
            type: action.type,
            category: index.result,
          });
        };
      } else {
        let keyRange = null; // values

        index = event.target.result
          .transaction('categories')
          .objectStore('categories')
          .index('account');

        keyRange = IDBKeyRange.only(parseInt(action.account));
        let cursor = index.openCursor(keyRange);
        cursor.onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
            const category = event.target.result.value;
            if (!category.parent || category.parent === category.id) {
              category.parent = null;
            }
            categoriesList.push(category);
            cursor.continue();
          } else {
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
              type: action.type,
              categoriesList: categoriesList,
              categoriesTree: categoriesTree,
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
  case UPDATE_ENCRYPTION: {
    encryption.key(action.cipher).then(() => {
      // Load transactions store
      var connectDB = indexedDB.open(DB_NAME, DB_VERSION);
      connectDB.onsuccess = function(event) {
        var customerObjectStore = event.target.result
          .transaction('categories', 'readwrite')
          .objectStore('categories')
          .openCursor();

        var categories = [];
        customerObjectStore.onsuccess = function(event) {

          var cursor = event.target.result;
          // If cursor.continue() still have data to parse.
          if (cursor) {
            const category = cursor.value;

            categories.push({ id: category.id, blob: generateBlob(category) });
            cursor.continue();
          } else {

            var iterator = categories.entries();

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
                url: action.url + '/api/v1/categories',
                method: 'PATCH',
                headers: {
                  Authorization: 'Token ' + action.token,
                },
                data: categories,
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
        .transaction('categories', 'readwrite')
        .objectStore('categories');

      customerObjectStore.clear();
    };
    break;
  }
  default:
    return;
  }
};