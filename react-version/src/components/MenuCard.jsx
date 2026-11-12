// Burger və yemək kartı. type = "burger" və ya "food" (CSS class-ları üçün)
export default function MenuCard({ item, type, onAdd }) {
    const price = Number.isInteger(item.price) ? item.price : item.price.toFixed(2);

    return (
        <div className={type + "-card"}>
            {item.image ? (
                <img src={item.image} alt={item.name} className={type + "-photo"} loading="lazy" />
            ) : (
                <div className={type + "-photo emoji-photo"}>{item.emoji}</div>
            )}
            <div className={type + "-info"}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className={type + "-bs"}>
                    <strong>Qiymət: {price} AZN</strong>
                    <button className="add" onClick={() => onAdd(item)}>+</button>
                </div>
            </div>
        </div>
    );
}
