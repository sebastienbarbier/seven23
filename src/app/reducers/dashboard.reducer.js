import { DASHBOARD_UPDATE_CONFIG, RESET } from "../constants";

const initialState = {
  range: 0,
  hiddenLines: [],
};

function dashboard(state = initialState, action) {
  switch (action.type) {
    case DASHBOARD_UPDATE_CONFIG:
      return Object.assign(
        {},
        {
          range: action.range,
          hiddenLines: action.hiddenLines,
        }
      );
    case RESET:
      return Object.assign({}, initialState);
    default:
      return state;
  }
}

export default dashboard;
