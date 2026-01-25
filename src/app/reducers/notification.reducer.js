import {LAST_ACTION,
       CURRENT_REMINDER_DATE, 
       UPDATE_NOTIFICATION_STATUS,
       NOTIFICATION_SETTINGS_LOADED} from "../constants.js"

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

        case UPDATE_NOTIFICATION_STATUS:
            return {
                ...state,
                notificationStatus: action.notificationStatus,
                };
        case NOTIFICATION_SETTINGS_LOADED:
            return{
                notificationStatus: action.notificationStatus,
                currentDateReminder: action.currentDateReminder,
                lastAction: action.lastAction,
            }
        default:
            return state;
    }
}
export default notification;