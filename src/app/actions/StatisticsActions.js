import {
  STATISTICS_DASHBOARD,
  STATISTICS_VIEWER,
  STATISTICS_PER_DATE,
  STATISTICS_PER_CATEGORY,
  STATISTICS_SEARCH,
  STATISTICS_NOMADLIST,
} from "../constants";

import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import Worker from "../workers/Statistics.worker";
const worker = new Worker();
let latest_search = null;

var StatisticsActions = {
  dashboard(begin, end) {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const uuid = uuidv4();
        worker.onmessage = function (event) {
          if (event.data.uuid == uuid) {
            resolve(event.data);
          }
        };
        worker.onerror = function (exception) {
          console.log(exception);
          reject(exception);
        };
        worker.postMessage({
          uuid,
          type: STATISTICS_DASHBOARD,
          transactions: getState().transactions,
          begin,
          end,
        });
      });
    };
  },

  report(begin, end) {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const uuid = uuidv4();
        worker.onmessage = function (event) {
          if (event.data.uuid == uuid) {
            console.log(event.data);
            resolve(event.data);
          }
        };
        worker.onerror = function (exception) {
          console.log(exception);
          reject(exception);
        };
        worker.postMessage({
          uuid,
          type: STATISTICS_VIEWER,
          transactions: getState().transactions,
          begin,
          end,
        });
      });
    };
  },

  perDate: (begin, end) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const uuid = uuidv4();
        worker.onmessage = function (event) {
          if (event.data.uuid == uuid) {
            resolve(event.data);
          }
        };
        worker.onerror = function (exception) {
          console.log(exception);
          reject(exception);
        };
        worker.postMessage({
          uuid,
          type: STATISTICS_PER_DATE,
          transactions: getState().transactions,
          transactions_filtered: [],
          begin,
          end,
        });
      });
    };
  },

  perCategory: (category) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const uuid = uuidv4();
        worker.onmessage = function (event) {
          if (event.data.uuid == uuid) {
            resolve(event.data);
          }
        };
        worker.onerror = function (exception) {
          console.log(exception);
          reject(exception);
        };
        worker.postMessage({
          uuid,
          type: STATISTICS_PER_CATEGORY,
          transactions: getState().transactions,
          category,
        });
      });
    };
  },

  search: (text) => {
    latest_search = uuidv4();
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        worker.onmessage = function (event) {
          if (event.data.uuid == latest_search) {
            resolve(event.data);
          }
        };
        worker.onerror = function (exception) {
          reject(exception);
        };
        worker.postMessage({
          uuid: latest_search,
          type: STATISTICS_SEARCH,
          transactions: getState().transactions,
          text,
        });
      });
    };
  },

  nomadlist: (trip = null, categoriesToExclude = []) => {
    latest_search = uuidv4();
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        worker.onmessage = function (event) {
          if (event.data.uuid == latest_search) {
            resolve(event.data);
          }
        };
        worker.onerror = function (exception) {
          reject(exception);
        };
        worker.postMessage({
          uuid: latest_search,
          type: STATISTICS_NOMADLIST,
          transactions: getState().transactions,
          nomadlist: getState().user.socialNetworks.nomadlist,
          categoriesToExclude,
        });
      });
    };
  },
};

export default StatisticsActions;