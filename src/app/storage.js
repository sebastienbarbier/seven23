import {
  DB_NAME,
  DB_VERSION
} from './constants';

let connection = null;

export class Storage {

  constructor() {
    connection = null;
  }

  connectIndexedDB() {
    return new Promise(function(resolve, reject) {
      try{
        let request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function(event) {
          connection = event.target.result;

          // Purge indexedb
          [...connection.objectStoreNames].forEach((item) => {
            connection.deleteObjectStore(item);
          });

          // Create an objectStore to hold information about our customers. We're
          // going to use "ssn" as our key path because it's guaranteed to be
          // unique - or at least that's what I was told during the kickoff meeting.
          var objectStore = connection.createObjectStore('transactions', { keyPath: 'id' });
          objectStore.createIndex('account', ['account'], { unique: false });
          objectStore.createIndex('category', ['account', 'category'], { unique: false });
          objectStore.createIndex('year', ['account', 'year'], { unique: false });
          objectStore.createIndex('month', ['account', 'year', 'month'], { unique: false });

          objectStore = connection.createObjectStore('changes', { keyPath: 'id' });
          objectStore.createIndex('account', 'account', { unique: false });

          objectStore = connection.createObjectStore('categories', { keyPath: 'id' });
          objectStore.createIndex('account', 'account', { unique: false });

          objectStore = connection.createObjectStore('currencies', { keyPath: 'id' });

        };
        request.onerror = function(event) {
          reject(event);
        };
        request.onsuccess = function(event) {
          connection = event.target.result;
          resolve();
        };
      } catch(err) {
        reject(err);
      }
    });
  }

  get db() {
    return connection;
  }

  set db(value) {
    this.db = value;
  }

  reset() {
    if (connection) {
      connection.close();
    }
  }

}

let StorageInstance = new Storage();

export default StorageInstance;
