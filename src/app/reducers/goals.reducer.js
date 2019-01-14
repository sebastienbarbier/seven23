import {
  GOALS_READ_REQUEST,
  GOALS_DELETE_REQUEST,
  GOALS_CREATE_REQUEST,
  GOALS_UPDATE_REQUEST,
  ACCOUNTS_SWITCH_REQUEST,
  ACCOUNTS_CURRENCY_REQUEST,
  USER_LOGOUT
} from '../constants';

const initialState = [];

function goals(state = initialState, action) {
  switch (action.type) {
  case GOALS_READ_REQUEST:
    return Array.from(action.goals);

  case GOALS_DELETE_REQUEST: {
    return state.filter(t => t.id !== action.id);
  }
  case GOALS_CREATE_REQUEST: {
    let goals = Array.from(state);
    goals.push(action.goal);
    return goals;
  }
  case GOALS_UPDATE_REQUEST: {
    let goals = Array.from(state);
    goals = goals.filter(t => t.id !== action.goal.id);
    goals.push(action.goal);
    return goals;
  }
  case ACCOUNTS_SWITCH_REQUEST: {
    return [];
  }
  case ACCOUNTS_CURRENCY_REQUEST: {
    return [];
  }
  case USER_LOGOUT:
    return initialState;
  default:
    return state;
  }
}

export default goals;