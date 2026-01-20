import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import axios from "axios";
import {  useState } from "react";
import { useSelector } from "react-redux";



import TaxReturnsForm from "./taxReturns/TaxReturnForm";
import ReceiptList from "./taxReturns/ReceiptList"

export default function TaxReturns(){

    const token = useSelector(s => s.user.token);
    const [files, setFiles] = useState([]);
    const emptyReceipt = { name: '', file: null, amount: 0 };
    const [currentReceipt, setCurrentReceipt] = useState({ name: '', amount: 0, file: null });

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
        dataToSend.append('name', currentReceipt.name);
        dataToSend.append('amount', currentReceipt.amount);
        try{
          const response= await axios.post('http://localhost:8000/api/v1/files/',dataToSend,
              {headers: {'Authorization':`Token ${token}` , 'Content-Type': 'multipart/form-data'}});
          console.log('form submitted', response.data)
          setFiles([...files,{...currentReceipt, id:Date.now()}])
          setCurrentReceipt(emptyReceipt); 
          event.target.reset();}
        
        catch(eror){
          console.log('sending eror',eror)
        }

    }
    // function that are related to TaxReturnForm
    const handleRemove = (id) => {
    setFiles(files.filter(f => f.id !== id));
    };
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
           {/* <ReceiptList recepitArry={files} remove={handleRemove} /> */}
           <ul>
            {files.map((file)=>(
              <li  key={file.id}>
                <p>{file.name}</p>
                <p>{file.amount}</p>
            </li>))}
            </ul>

        </div>
);
}