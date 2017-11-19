import { DB_NAME, DB_VERSION } from "./constants";

export class Storage {
  constructor() {}

  connectIndexedDB() {
    return new Promise(function(resolve, reject) {
      try {
        let request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function(event) {
          let connection = event.target.result;

          // Purge indexedb
          [...connection.objectStoreNames].forEach(item => {
            connection.deleteObjectStore(item);
          });

          // Create an objectStore to hold information about our customers. We're
          // going to use "ssn" as our key path because it's guaranteed to be
          // unique - or at least that's what I was told during the kickoff meeting.
          var objectStore = connection.createObjectStore("transactions", {
            keyPath: "id",
          });
          objectStore.createIndex("account", ["account"], { unique: false });
          objectStore.createIndex("date", "date", { unique: false });
          objectStore.createIndex("category", ["account", "category"], {
            unique: false,
          });

          objectStore = connection.createObjectStore("changes", {
            keyPath: "id",
          });
          objectStore.createIndex("account", "account", { unique: false });

          objectStore = connection.createObjectStore("categories", {
            keyPath: "id",
          });
          objectStore.createIndex("account", "account", { unique: false });

          objectStore = connection.createObjectStore("currencies", {
            keyPath: "id",
          });
        };
        request.onblocked = function(event) {
          console.error(event);
          reject(event);
        };

        request.onerror = function(event) {
          console.error(event);
          reject(event);
        };
        request.onsuccess = function(event) {
          resolve(event.target.result);
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  reset() {
    if (connection) {
      connection.close();
    }
  }
}

let StorageInstance = new Storage();

export default StorageInstance;
