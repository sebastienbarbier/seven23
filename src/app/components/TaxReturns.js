/**
 * @file TaxReturn.js
 * @author Rachel Avraham
 */
/**  this feature allows the user to uppload PDF of receipt, good for tax return, will be good also for saving Warranty Certificate.
 consider to add differnet list for Warranty Certificate
 consider to add button to download all the receipt at the same time
 consider to add visabillty of PDF on page & security for PDF
 consider adding a filter to receipt list to filter by year
 */

import {  useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import TaxReturnsForm from "./taxReturns/TaxReturnForm";
import ReceiptList from "./taxReturns/ReceiptList"
import TaxReturnsAction from "../actions/TaxReturnsAction";

export default function TaxReturns(){

    const token = useSelector(s => s.user.token);
    const dispatch = useDispatch();
    const files = useSelector(s => s.taxReturns.files);
    const emptyReceipt = { name: '', file: null, amount: 0 };
    const [currentReceipt, setCurrentReceipt] = useState({ name: '', amount: 0, file: null });

    console.log(files)


    useEffect(() => {dispatch(TaxReturnsAction.fetchReceipt(token));;}, [dispatch, token]);

    // function that are related to TaxReturnForm
    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
          alert("file size is above 5MB");
          e.target.value = ""; 
          return;
      }
      console.log('a file was selected')
      setCurrentReceipt({ ...currentReceipt, file: selectedFile });                  
      }
    const handleSubmit= async(event)=>{
        event.preventDefault();
        if (!currentReceipt.file || currentReceipt.amount <= 0) {
            alert("Please fill all fields and select a file");
            return;
        }
        console.log("user entered new recipt", currentReceipt);
        const dataToSend = new FormData()
        dataToSend.append('file', currentReceipt.file);
        dataToSend.append('title', currentReceipt.name);
        dataToSend.append('amount', currentReceipt.amount);
        try{
          const response= await TaxReturnsAction.sendReceipt(dataToSend, token) ;
          dispatch(TaxReturnsAction.sendReceipt(dataToSend,token));
          console.log('form submitted', response.data)
          setCurrentReceipt(emptyReceipt); 
          event.target.reset();}
        
        catch(eror){
          console.log('sending eror',eror)
        }

    }
    // function that are related to ReceiptItem
    const handleRemove = async (id) => {
       dispatch(TaxReturnsAction.removeReceipt(id));
       };
    const fetchSingleReceipt=(id) => {
      dispatch(TaxReturnsAction.fetchSingleReceipt(token,id));}

    const sumOfReceipt = files.reduce((sum, f) => sum + f.amount, 0);
    
    return(
        <div>
           <h1>tax return form</h1>
           <TaxReturnsForm 
           currentReceipt={currentReceipt} 
           onFileChange={handleFileChange} 
           onNameChange={(val) => setCurrentReceipt({...currentReceipt, name: val})} 
           onAmountChange={(val) => setCurrentReceipt({...currentReceipt, amount: parseFloat(val) || 0})} 
           onSubmit={handleSubmit}/> 
           <p>the sum of all the recepit is {sumOfReceipt}</p>
           <ReceiptList receiptArry={files} remove={handleRemove} singleReceipt={fetchSingleReceipt}/>


        </div>
);
}


//
