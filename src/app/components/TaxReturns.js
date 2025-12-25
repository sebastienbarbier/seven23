import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import {  useState } from "react";

import TaxReturnsForm from "./taxReturns/TaxReturnForm";

export default function TaxReturns(){
    const [files, setFiles] = useState([]);
    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      const newReceipt = {
        id: Date.now(), 
        name: '',             
        file: selectedFile,
        amount: 0                     
      }
      setFiles([...files, newReceipt]);
    }
    const handleNameChange =(id, value) => {
        setFiles(files.map(f => 
            f.id === id? {...f, name: value } : f
        ))
    }
    const handleAmountChange = (id, value) => {
        setFiles(files.map(f => 
          f.id === id ? { ...f, amount: parseFloat(value) } : f
        ));
    };
    const handleRemove = (id) => {
    setFiles(files.filter(f => f.id !== id));
    };
    const sumOfReceipt = files.reduce((sum, f) => sum + f.amount, 0);
    
    return(
        <div>
           <h1>tax return form</h1>
           <TaxReturnsForm files={files} onFileChange={handleFileChange} onNameChange={handleNameChange} onAmountChange={handleAmountChange}/> 
           <p>the sum of all the recepit is {sumOfReceipt}</p>
        </div>
);
}