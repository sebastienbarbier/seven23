import {  useState } from "react";

export default function TaxReturnsForm({files, onFileChange, onNameChange, onAmountChange}){

return (
    <div>
      <input type="file" onChange={onFileChange} />
      {files.map(receipt => (
        <div key={receipt.id}>
        <input type="text" value={receipt.name || ''} onChange={(e) => onNameChange(receipt.id, e.target.value)} placeholder="name for the receipt"/>
          <p>{receipt.file.name}</p>
          <input 
            type="number"
            step={0.01}
            min={0}
            placeholder="enter receipt amount"
            value={receipt.amount}
            onChange={(e) => onAmountChange(receipt.id, e.target.value)}
          />
          <button>add</button> {/**pressing the button will maker the item appere on page and send to backend and clear the fields */}
        </div>
      ))}
    </div>
);
}