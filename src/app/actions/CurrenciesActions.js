
import axios from 'axios';

import { CURRENCIES_SYNC_REQUEST } from '../constants';

var CurrenciesActions = {

  sync: () => {
    return (dispatch, getState) => {

      return new Promise((resolve, reject) => {
        axios({
          url: '/api/v1/currencies',
          method: 'get',
          headers: {
            Authorization: 'Token ' + getState().user.token,
          },
        })
          .then(function(response) {
            const currencies = response.data;
            console.log('currencies', currencies);
            dispatch({
              type: CURRENCIES_SYNC_REQUEST,
              currencies: currencies
            });

            resolve(currencies);
          })
          .catch(function(ex) {
            console.error(ex);
            reject(ex);
          });
      });
    };
  },
};

export default CurrenciesActions;
