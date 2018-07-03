import {
  SERVER_CONNECT,
} from '../constants';

const initialState = {};

function server(state = initialState, action) {
  switch (action.type) {
  case SERVER_CONNECT:
    return Object.assign({}, state, action.server);
  default:
    return state;
  }
}

export default server;