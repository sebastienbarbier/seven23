import {
  SERVER_CONNECT,
} from '../constants';

const initialState = {};

function server(state = initialState, action) {
  switch (action.type) {
  case SERVER_CONNECT:
    return Object.assign({}, state, action.server);
  //   case ADD_TODO:
  //     return Object.assign({}, state, {
  //       todos: todos(state.todos, action)
  //     });
  //   case TOGGLE_TODO:
  //     return Object.assign({}, state, {
  //       todos: todos(state.todos, action)
  //     });
  default:
    return state;
  }
}

export default server;