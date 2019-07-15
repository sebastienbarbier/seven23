import {
  STATISTICS_DASHBOARD,
  STATISTICS_VIEWER,
  STATISTICS_PER_DATE,
  STATISTICS_PER_CATEGORY
} from "../constants";

import { useCallback } from "react";
import uuidv4 from "uuid/v4";
import Worker from "../workers/Statistics.worker";
const worker = new Worker();

var StatisticsActions = {
  dashboard() {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const uuid = uuidv4();
        worker.onmessage = function(event) {
          if (event.data.uuid == uuid) {
            resolve(event.data);
          }
        };
        worker.onerror = function(exception) {
          console.log(exception);
          reject(exception);
        };
        worker.postMessage({
          uuid,
          type: STATISTICS_DASHBOARD,
          transactions: getState().transactions
        });
      });
    };
  },

  report(begin, end) {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const uuid = uuidv4();
        worker.onmessage = function(event) {
          if (event.data.uuid == uuid) {
            resolve(event.data);
          }
        };
        worker.onerror = function(exception) {
          console.log(exception);
          reject(exception);
        };
        worker.postMessage({
          uuid,
          type: STATISTICS_VIEWER,
          transactions: getState().transactions,
          begin,
          end
        });
      });
    };
  },

  perDate: (begin, end) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const uuid = uuidv4();
        worker.onmessage = function(event) {
          if (event.data.uuid == uuid) {
            resolve(event.data);
          }
        };
        worker.onerror = function(exception) {
          console.log(exception);
          reject(exception);
        };
        worker.postMessage({
          uuid,
          type: STATISTICS_PER_DATE,
          transactions: getState().transactions,
          transactions_filtered: [],
          begin,
          end
        });
      });
    };
  },

  perCategory: category => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const uuid = uuidv4();
        worker.onmessage = function(event) {
          if (event.data.uuid == uuid) {
            resolve(event.data);
          }
        };
        worker.onerror = function(exception) {
          console.log(exception);
          reject(exception);
        };
        worker.postMessage({
          uuid,
          type: STATISTICS_PER_CATEGORY,
          transactions: getState().transactions,
          category
        });
      });
    };
  }
};

export default StatisticsActions;
