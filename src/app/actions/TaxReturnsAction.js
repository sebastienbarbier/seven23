import axios from "axios";
//import encryption from "../encryption"; check how to add this local libary to protect info
import {RECEIPTS_FETCH_SUCCESS, RECEIPTS_SEND_SUCCESS, RECEIPTS_REMOVE_SUCCESS, SINGLE_RECEIPT_FETCH, SINGLE_RECEIPT_FETCH_FAILURE} from "../constants";




const TaxReturnsAction={
    fetchReceipt: (token) => async (dispatch, getState) =>{{
            token = token || getState().user.token;
            const response= await axios({
                url: "/api/v1/files/",
                method: "get",
                headers: {
                Authorization: "Token " + token,
                },
            })
            dispatch({
              type: RECEIPTS_FETCH_SUCCESS,
              files: response.data,
             })
             return response.data;;
        
    }},
    sendReceipt: (dataToSend, token)=>async (dispatch, getState) => {
            token = token || getState().user.token;
            const response= await axios.post(
                "/api/v1/files/",
                dataToSend,
              {headers: {'Authorization':`Token ${token}` , }})
            dispatch({
                type: RECEIPTS_SEND_SUCCESS, 
                file: response.data
            })
            return response.data;;
    }, 
    removeReceipt: (id) => async (dispatch, getState) => {
        const token = getState().user.token;

        await axios.delete(`/api/v1/files/${id}/`, {
          headers: { Authorization: `Token ${token}` },
          });

         dispatch({
          type: RECEIPTS_REMOVE_SUCCESS,
         id,
        });
    },
    fetchSingleReceipt: (token,id)=>async(dispatch, getState)=>{
        token = token || getState().user.token;
        dispatch({ type: SINGLE_RECEIPT_FETCH, id });

        try{const response= await axios({
                url: `/api/v1/files/${id}/`,
                method: "get",
                headers: {
                Authorization: "Token " + token,
                },
            })
            dispatch({
              type: SINGLE_RECEIPT_FETCH ,
              receipt: response.data,
             })
             return response.data;;}
             catch(err){
                dispatch({
                     type: SINGLE_RECEIPT_FETCH_FAILURE,
                     error: err?.response?.data || err?.message || "Failed to fetch receipt",
                });
                throw err;
             }

    }

}
    
export default TaxReturnsAction;
