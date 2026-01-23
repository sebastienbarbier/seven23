import { useSelector } from "react-redux";


export default function ReceiptItem(){

    const currentReceipt = useSelector(s => s.taxReturns.selectedReceipt);
    if (!currentReceipt) return null;
    console.log(currentReceipt.file)


    
    return(
        <>
        <a href={currentReceipt.file} target="_blank" rel="noreferrer" >open in new tab</a>
        <button>⬇️</button>
        </>

    );
}