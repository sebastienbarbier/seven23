import axios from "axios";
import {LAST_ACTION,
    CURRENT_REMINDER_DATE,
    UPDATE_NOTIFICTION_STATUS } from "../constants.js"

const NotifictionAction={
    postLastAction: (token, dataToSend)=>async (dispatch, getState)=>{
            token = token || getState().user.token;
            const response= await axios({
                url: "/api/v1/notifications-settings/",   //need to add an endpoint
                method: "patch",
                data: dataToSend,
                headers: {
                Authorization: "Token " + token,
                },
            })
            dispatch({
                type:LAST_ACTION,
                lastAction: response.data.lastAction,

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
    
    postNotifictionStatus: (token, dataToSend)=>async (dispatch, getState)=>{
            token = token || getState().user.token;
            const response= await axios({
                url: "/api/v1/notifications-settings/",   //need to add an endpoint
                method: "patch",
                data: dataToSend,
                headers: {
                Authorization: "Token " + token,
                },
            })
            dispatch({
                type: UPDATE_NOTIFICTION_STATUS,
                notificationStatus: response.data.notificationStatus,

            })
            return response.data;
    }



}

export default NotifictionAction;