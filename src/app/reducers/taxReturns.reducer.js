import {RECEIPTS_FETCH_SUCCESS,RECEIPTS_SEND_SUCCESS, RECEIPTS_REMOVE_SUCCESS,SINGLE_RECEIPT_FETCH, SINGLE_RECEIPT_FETCH_FAILURE} from "../constants";

const initialState= {
    files: [],
    selectedReceipt: null, 
    selectedReceiptError: null, 
};

function taxReturns(state = initialState, action){
    switch(action.type){
        case RECEIPTS_FETCH_SUCCESS: 
            return Object.assign({}, state, {
                ...state,
                files: action.files,
                }
             );

        case RECEIPTS_SEND_SUCCESS:
            return Object.assign({}, state, {
                ...state,
                files: [...state.files, action.file],
                }
             );
        case RECEIPTS_REMOVE_SUCCESS:
            return {
                  ...state,
                  files: state.files.filter(f => f.id !== action.id),
            };
        case SINGLE_RECEIPT_FETCH:
            return{
                ...state,
                selectedReceipt: action.receipt,

            }
        case SINGLE_RECEIPT_FETCH_FAILURE:
      return {
        ...state,
        selectedReceiptError: action.error,
      };

        default:
            return state;
    }
}
export default taxReturns;