export default function ReceiptList({receiptArry, remove}){



    return(
        <>
        <h2>your receipt</h2>
        <ul>
            {receiptArry.map((item)=>(
                <li key={item.id} > 
                    <p>{item.title}</p>
                    <p>{item.amount}</p>
                    <p> {new Date(item.uploaded_at).toLocaleDateString('he-IL')}</p>
                    <a href={item.file} target="_blank" rel="noreferrer">
                        ➕
                        </a> 
                    <button onClick={()=>{remove(item.id)}}>🗑️</button>
                    </li>
            ))
            }
        </ul>
        </>
    );
}