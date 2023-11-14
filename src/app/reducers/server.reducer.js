import {
  SERVER_SYNCED,
  USER_LOGIN,
  API_DEFAULT_URL,
  SERVER_CONNECT,
  SERVER_CONNECTING,
  SERVER_CONNECT_FAIL,
  USER_LOGOUT,
  SERVER_LAST_EDITED,
  SERVER_INIT,
  SERVER_ADD,
  SERVER_REMOVE,
  RESET
} from "../constants";

const generateName = (url) => {
  return url
  .replace("http://", "")
  .replace("https://", "")
  .replace("api.seven23.io", "Seven23.io")
  .split(/[/?#]/)[0]
  .split(/[:?#]/)[0]
};

const url = API_DEFAULT_URL;
const name = generateName(url);

const initialState = {
  url,
  name,
  servers: [{
    name: generateName(url),
    url: API_DEFAULT_URL,
    isOfficial: true,
  }],
  isLogged: false,
  userIsBack: false
};

function server(state = initialState, action) {
  switch (action.type) {
    case SERVER_CONNECT:
      return Object.assign({}, initialState, state, action.server, {
        userIsBack: state.userIsBack
      });
    case SERVER_CONNECTING:
      return Object.assign({}, initialState, state, {
          name: generateName(action.url),
          url: action.url,
        });
    case SERVER_CONNECT_FAIL:
      return Object.assign({}, initialState, state, action, {
        userIsBack: state.userIsBack
      });
    case SERVER_INIT:
      return Object.assign({}, initialState, state, {
        products: action.server.products,
        terms_and_conditions: action.server.terms_and_conditions,
        allow_account_creation: action.server.allow_account_creation,
        saas: action.server.saas,
        trial_period: action.server.trial_period,
        isOfficial: action.server.isOfficial
      });
    case SERVER_SYNCED: {
      const last_sync = new Date().toISOString();
      return Object.assign({}, state, {
        last_sync: last_sync,
        last_edited: state.last_edited_tmp
      });
    }
    case SERVER_ADD: {
      return Object.assign({}, state, {
        servers: [...state.servers, {
          name: generateName(action.url),
          url: action.url,
        }]
      });
    }
    case SERVER_REMOVE: {
      const needToSwitch = state.url == action.url;
      return Object.assign({}, state, {
        name: !needToSwitch ? state.name : state.servers.find(s => s.isOfficial).name,
        url: !needToSwitch ? state.url : state.servers.find(s => s.isOfficial).url,
        servers: state.servers.filter(s => s.url != action.url)}
      );
    }
    case USER_LOGIN:
      return Object.assign({}, state, {
        isLogged: true,
        userIsBack: true
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
        last_edited_tmp
      });
    }
    case USER_LOGOUT:
      return Object.assign({}, state, {
        isLogged: false,
        last_edited: null
      });
    case RESET:
      return Object.assign({}, initialState);
    default:
      return state;
  }
}

export default server;