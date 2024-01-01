import axios from "axios";

import { CURRENCIES_SYNC_REQUEST } from "../constants";

var CurrenciesActions = {
  sync: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const currencies = getState().currencies;
        if (currencies && Array.isArray(currencies) && currencies.length) {
          resolve();
        } else {
          axios({
            url: "/api/v1/currencies",
            method: "get",
            headers: {
              Authorization: "Token " + getState().user.token,
            },
          })
            .then(function (response) {
              const currencies = response.data;
              dispatch({
                type: CURRENCIES_SYNC_REQUEST,
                currencies: currencies,
              });

              resolve(currencies);
            })
            .catch(function (ex) {
              console.error(ex);
              reject(ex);
            });
        }
      });
    };
  },

  get: (id) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        resolve(getState()?.currencies?.find((c) => c.id == id));
      });
    };
  },
};

export default CurrenciesActions;
