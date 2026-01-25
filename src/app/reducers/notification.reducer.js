import {LAST_ACTION,
       CURRENT_REMINDER_DATE, 
       UPDATE_NOTIFICTION_STATUS} from "../constants.js"

const initialState= {
    notificationStatus: false,
    lastAction: null, 
    currentDateReminder: null, 
};

function notification(state = initialState, action){
    switch (action.type){
        case LAST_ACTION:
            return {
                ...state,
                lastAction: action.lastAction,
                };
        
        case CURRENT_REMINDER_DATE:
            return {
                ...state,
                currentDateReminder: action.currentDateReminder,
                };

        case UPDATE_NOTIFICTION_STATUS:
            return {
                ...state,
                notificationStatus: action.notificationStatus,
                };
        default:
            return state;
    }
}
export default notification;