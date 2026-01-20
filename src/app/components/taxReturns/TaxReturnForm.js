
export default function TaxReturnsForm({currentReceipt, onFileChange, onNameChange, onAmountChange, onSubmit}){

 
return (
    <form id="reciptForm" onSubmit={onSubmit}>
      <input 
      name="reciptFile" 
      type="file" onChange={onFileChange} 
      required/>
      <input
      type="text" 
      name="reciptName" 
      maxLength={10} // to prevent Code Injection even though axois will take care of that
      pattern="[a-zA-Z0-9 א-ת]*"  // to prevent Code Injection
      onChange={(e) => onNameChange(e.target.value)} 
      placeholder="name for the receipt"
      value={currentReceipt.name || ''} />
      <p>{currentReceipt.name}</p>
      <input 
      name="reciptAmount"
      type="number"
      step={0.01}
      min={0}
      placeholder="enter receipt amount"
      onChange={(e) => onAmountChange(e.target.value)}
      value={currentReceipt.amount || ''}
      required/>
      <button type="submit">add</button> {/**pressing the button will maker the item appere on page and send to backend and clear the fields */}
    </form>
);
}