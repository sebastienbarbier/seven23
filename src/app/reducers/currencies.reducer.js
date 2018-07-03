const initialState = {};

function currencies(state = initialState, action) {
  switch (action.type) {
  //   case SET_VISIBILITY_FILTER:
  //     return Object.assign({}, state, {
  //       visibilityFilter: action.filter
  //     });
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

export default currencies;