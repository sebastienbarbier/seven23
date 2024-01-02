import {
  API_DEFAULT_URL,
  RESET,
  SERVER_ADD,
  SERVER_CONNECT,
  SERVER_CONNECTING,
  SERVER_CONNECT_FAIL,
  SERVER_INIT,
  SERVER_LAST_EDITED,
  SERVER_REMOVE,
  SERVER_SYNCED,
  USER_LOGIN,
  USER_LOGOUT,
} from "../constants";

const generateName = (url) => {
  return url
    .replace("http://", "")
    .replace("https://", "")
    .replace("api.seven23.io", "Seven23.io")
    .split(/[/?#]/)[0]
    .split(/[:?#]/)[0];
};

const url = API_DEFAULT_URL;
const name = generateName(url);

const initialState = {
  url,
  name,
  servers: [
    {
      name: generateName(url),
      url: API_DEFAULT_URL,
      isOfficial: true,
    },
  ],
  isLogged: false,
  userIsBack: false,
  isConnected: false,
};

function server(state = initialState, action) {
  switch (action.type) {
    case SERVER_CONNECT:
      return Object.assign({}, initialState, state, action.server, {
        userIsBack: state.userIsBack,
        isConnected: true,
      });
    case SERVER_CONNECTING:
      return Object.assign({}, initialState, state, {
        name: generateName(action.url ? action.url : state.url),
        url: action.url,
        stripe_product: null,
        stripe_prices: null,
        subscription: null,
        terms_and_conditions: null,
        allow_account_creation: null,
        trial_period: null,
        isOfficial: null,
      });
    case SERVER_CONNECT_FAIL:
      return Object.assign({}, initialState, state, action, {
        userIsBack: state.userIsBack,
        stripe_product: null,
        stripe_prices: null,
        subscription: null,
        subscription_price: null,
        terms_and_conditions: null,
        allow_account_creation: null,
        saas: null,
        trial_period: null,
        isOfficial: null,
        isConnected: false,
      });
    case SERVER_INIT:
      return Object.assign({}, initialState, state, {
        stripe_product: action.server.stripe_product,
        stripe_prices: action.server.stripe_prices,
        subscription: action.server.subscription,
        subscription_price: action.server.subscription_price,
        terms_and_conditions: action.server.terms_and_conditions,
        allow_account_creation: action.server.allow_account_creation,
        saas: action.server.saas,
        trial_period: action.server.trial_period,
        isOfficial: action.server.isOfficial,
        isConnected: true,
      });
    case SERVER_SYNCED: {
      const last_sync = new Date().toISOString();
      return Object.assign({}, state, {
        last_sync: last_sync,
        last_edited: state.last_edited_tmp,
      });
    }
    case SERVER_ADD: {
      return Object.assign({}, state, {
        servers: [
          ...state.servers,
          {
            name: generateName(action.url),
            url: action.url,
          },
        ],
      });
    }
    case SERVER_REMOVE: {
      const needToSwitch = state.url == action.url;
      return Object.assign({}, state, {
        name: !needToSwitch
          ? state.name
          : state.servers.find((s) => s.isOfficial).name,
        url: !needToSwitch
          ? state.url
          : state.servers.find((s) => s.isOfficial).url,
        servers: state.servers.filter(
          (s) => s.url != action.url || s.isOfficial == true
        ),
      });
    }
    case USER_LOGIN:
      return Object.assign({}, state, {
        isLogged: true,
        userIsBack: true,
      });
    case SERVER_LAST_EDITED: {
      let last_edited_tmp;
      if (!state.last_edited_tmp) {
        last_edited_tmp = action.last_edited;
      } else {
        last_edited_tmp =
          state.last_edited_tmp < action.last_edited
            ? action.last_edited
            : state.last_edited_tmp;
      }
      return Object.assign({}, state, {
        last_edited_tmp,
      });
    }
    case USER_LOGOUT:
      return Object.assign({}, state, {
        isLogged: false,
        last_edited: null,
      });
    case RESET:
      return Object.assign({}, initialState);
    default:
      return state;
  }
}

export default server;
