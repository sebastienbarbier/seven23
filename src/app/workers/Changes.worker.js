import {
  CHANGES_CREATE_REQUEST,
  CHANGES_READ_REQUEST,
  CHANGES_UPDATE_REQUEST,
  CHANGES_DELETE_REQUEST,
  DB_NAME,
  DB_VERSION
} from '../constants';

import axios from 'axios';

onmessage = function(event) {

  // Action object is the on generated in action object
  const action = event.data;

  switch(action.type){
    case CHANGES_CREATE_REQUEST:

      break;
    case CHANGES_READ_REQUEST:
      let index = null; // criteria
      let keyRange = null; // values
      let changes = []; // Set object of Transaction

      let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
      connectDB.onsuccess = function(event) {
        if (action.id) {
          index = event.target.result
                    .transaction('changes')
                    .objectStore('changes')
                    .get(parseInt(action.id))
          index.onsuccess = (event) => {
            ChangeStoreInstance.emitChange(index.result);
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
              changes = changes.sort((a, b) => { return a.date > b.date ? -1 : 1;});

              postMessage({
                type: action.type,
                changes: changes,
              });

            }
          };
        }
      };
      connectDB.onerror = function(event) {
        console.error(event);
      };
      break;
    case CHANGES_UPDATE_REQUEST:

      break;
    case CHANGES_DELETE_REQUEST:

      break;

    default:
      return;
    }
}