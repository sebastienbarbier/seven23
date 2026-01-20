import ReceiptItem from "./ReceiptItem"

export default function ReceiptList({recepitArry, remove}){

    return(
        <>
        <h2>your receipt</h2>
        <ul>
            <li>
                {/* here we use map */}
            </li>
        </ul>
        <ReceiptItem recepitArry={recepitArry} remove={remove}/>
        </>

    );
}