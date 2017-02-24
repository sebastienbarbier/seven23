const DB_NAME = '723e';
const DB_VERSION = 1;

let connection = null;

class Storage {

  constructor() {
    connection = null;
  }

  connectIndexedDB() {
    return new Promise(function(resolve, reject) {
      try{
        let request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function(event) {
          connection = event.target.result;

                  // Create an objectStore to hold information about our customers. We're
                  // going to use "ssn" as our key path because it's guaranteed to be
                  // unique - or at least that's what I was told during the kickoff meeting.
          var objectStore = connection.createObjectStore('transactions', { keyPath: 'id' });
          objectStore.createIndex('id', 'id', { unique: true });
          objectStore.createIndex('category', 'category', { unique: false });
          objectStore.createIndex('year', 'year', { unique: false });
          objectStore.createIndex('yearmonth', 'yearmonth', { unique: false });

          objectStore = connection.createObjectStore('changes', { keyPath: 'id' });
          objectStore.createIndex('date', 'date', { unique: false });
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
