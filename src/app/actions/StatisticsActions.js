import {
  STATISTICS_DASHBOARD,
  STATISTICS_VIEWER,
  STATISTICS_PER_DATE,
  STATISTICS_PER_CATEGORY
} from "../constants";

import { useCallback } from "react";
import Worker from "../workers/Statistics.worker";
const worker = new Worker();

var StatisticsActions = {
  dashboard() {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        worker.onmessage = function(event) {
          if (event.data.type === STATISTICS_DASHBOARD) {
            resolve(event.data);
          } else {
            console.error(event);
            reject(event);
          }
        };
        worker.onerror = function(exception) {
          console.log(exception);
        };
        worker.postMessage({
          type: STATISTICS_DASHBOARD,
          transactions: getState().transactions
        });
      });
    };
  },

  report(begin, end) {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        worker.onmessage = function(event) {
          if (event.data.type === STATISTICS_VIEWER) {
            resolve(event.data);
          } else {
            reject(event);
          }
        };
        worker.onerror = function(exception) {
          reject(exception);
        };
        worker.postMessage({
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
        const promiseFromWorker = new Promise((resolve, reject) => {
          worker.onmessage = function(event) {
            if (event.data.type === STATISTICS_PER_DATE) {
              resolve(event.data);
            } else {
              console.error(event);
              reject(event);
            }
          };
          worker.onerror = function(exception) {
            console.log(exception);
          };
          worker.postMessage({
            type: STATISTICS_PER_DATE,
            transactions: getState().transactions,
            transactions_filtered: [],
            begin,
            end
          });
        });

        promiseFromWorker.then(resolve).catch(reject);
      });
    };
  },

  perCategory: category => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        worker.onmessage = function(event) {
          if (event.data.type === STATISTICS_PER_CATEGORY) {
            resolve(event.data);
          } else {
            console.error(event);
            reject(event);
          }
        };
        worker.onerror = function(exception) {
          console.log(exception);
        };
        worker.postMessage({
          type: STATISTICS_PER_CATEGORY,
          transactions: getState().transactions,
          category
        });
      });
    };
  }
};

export default StatisticsActions;
