import {
  CATEGORIES_CREATE_REQUEST,
  CATEGORIES_READ_REQUEST,
  CATEGORIES_UPDATE_REQUEST,
  CATEGORIES_DELETE_REQUEST,
  DB_NAME,
  DB_VERSION,
} from '../constants';

import axios from 'axios';

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
    case CATEGORIES_READ_REQUEST:
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
              categoriesList.push(event.target.result.value);
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
    default:
      return;
  }
};
