import axios from "axios";
import {LAST_ACTION,
    CURRENT_REMINDER_DATE,
    UPDATE_NOTIFICATION_STATUS,
    NOTIFICATION_SETTINGS_LOADED } from "../constants.js"

const NotificationAction={
    postLastAction: (token, dataToSend)=>async (dispatch, getState)=>{
            token = token || getState().user.token;
            const response= await axios({
                url: "/api/v1/notifications-settings/",   //need to add an endpoint
                method: "patch",
                data: { last_action: dataToSend },
                headers: {
                Authorization: "Token " + token,
                },
            })
            dispatch({
                type:LAST_ACTION,
                lastAction: response.data.last_action,

            })
            return response.data;

    },
    postCurrentReminderDate:(token, dataToSend)=>async (dispatch, getState)=>{
            token = token || getState().user.token;
            const response= await axios({
                url: "/api/v1/notifications-settings/",   //need to add an endpoint
                method: "patch",
                data: { current_date_reminder: dataToSend },
                headers: {Authorization: "Token " + token,},
            })
            dispatch({
                type: CURRENT_REMINDER_DATE,
                currentDateReminder: response.data.current_date_reminder,

            })
            return response.data;
    },
    getCurrentReminderDate: (token)=> async(dispatch, getState)=>{
            token = token || getState().user.token;
            const response = await axios({
                url: "/api/v1/notifications-settings/",   //need to add an endpoint
                method: "get",
                headers:{
                    Authorization: "Token " + token,
                },
            })
            dispatch({
                type: CURRENT_REMINDER_DATE,
                currentDateReminder: response.data.current_date_reminder,

            })
            return response.data;

    },
    getNotificationSettings:(token)=>async(dispatch, getState)=>{
        token = token || getState().user.token;
            const response = await axios({
                url: "/api/v1/notifications-settings/",  
                method: "get",
                headers:{
                    Authorization: "Token " + token,
                },
            })
            dispatch({
                type: NOTIFICATION_SETTINGS_LOADED,
                currentDateReminder: response.data.current_date_reminder,
                notificationStatus: response.data.notification_status,
                lastAction: response.data.last_action,

            })
            return response.data;
    },
    
    postNotificationStatus: (token, dataToSend)=>async (dispatch, getState)=>{
            token = token || getState().user.token;
            const response= await axios({
                url: "/api/v1/notifications-settings/",   //need to add an endpoint
                method: "patch",
                data: { notification_status: dataToSend },
                headers: {
                Authorization: "Token " + token,
                },
            })
            dispatch({
                type: UPDATE_NOTIFICATION_STATUS,
                notificationStatus: response.data.notification_status,

            })
            return response.data;
    }



}

export default NotificationAction;