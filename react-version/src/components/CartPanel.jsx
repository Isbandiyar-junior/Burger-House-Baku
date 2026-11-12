import { useState } from "react";

const emptyCustomer = { name: "", phone: "", address: "" };

function validate(c) {
    if (c.name.trim().length < 2) return "Adınızı daxil edin.";
    if (!/^\+?\d{9,15}$/.test(c.phone.replace(/[\s-]/g, ""))) return "Düzgün telefon nömrəsi daxil edin.";
    if (c.address.trim().length < 5) return "Ünvanı daxil edin.";
    return "";
}

export default function CartPanel({ open, cart, total, onClose, onChangeQty, onClear, onCheckout }) {
    const [customer, setCustomer] = useState(emptyCustomer);
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const empty = cart.length === 0;

    function update(field, value) {
        setCustomer({ ...customer, [field]: value });
    }

    async function handleCheckout() {
        const problem = validate(customer);
        setError(problem);
        if (problem) return;

        setSending(true);
        const serverError = await onCheckout({
            name: customer.name.trim(),
            phone: customer.phone.trim(),
            address: customer.address.trim(),
        });
        setSending(false);

        if (serverError) {
            setError(serverError);
        } else {
            setCustomer(emptyCustomer);
        }
    }

    return (
        <>
            <div className={"overlay" + (open ? " show" : "")} onClick={onClose}></div>
            <aside className={"cart-panel" + (open ? " open" : "")}>
                <div className="cart-header">
                    <h2>Səbətiniz</h2>
                    <button className="close-cart" onClick={onClose}>✕</button>
                </div>

                <ul className="cart-items">
                    {cart.map((item) => (
                        <li className="cart-item" key={item.name}>
                            <div>
                                <div className="cart-item-name">{item.name}</div>
                                <div className="cart-item-price">{(item.price * item.qty).toFixed(2)} AZN</div>
                            </div>
                            <div className="qty">
                                <button onClick={() => onChangeQty(item.name, -1)}>−</button>
                                <span>{item.qty}</span>
                                <button onClick={() => onChangeQty(item.name, 1)}>+</button>
                            </div>
                        </li>
                    ))}
                </ul>

                {empty && <p className="cart-empty">Səbətiniz boşdur 🍔</p>}

                <div className="cart-footer">
                    <div className="cart-total">
                        <span>Cəmi:</span>
                        <strong>{total.toFixed(2)} AZN</strong>
                    </div>
                    <form className="order-form" onSubmit={(e) => e.preventDefault()} noValidate>
                        <input type="text" placeholder="Adınız" autoComplete="name"
                            value={customer.name} onChange={(e) => update("name", e.target.value)} />
                        <input type="tel" placeholder="Telefon: +994 50 123 45 67" autoComplete="tel"
                            value={customer.phone} onChange={(e) => update("phone", e.target.value)} />
                        <input type="text" placeholder="Çatdırılma ünvanı" autoComplete="street-address"
                            value={customer.address} onChange={(e) => update("address", e.target.value)} />
                        <div className="error">{error}</div>
                        <p className="consent">
                            Sifariş verməklə <a href="/terms.html" target="_blank">İstifadə Şərtlərini</a> və{" "}
                            <a href="/privacy.html" target="_blank">Məxfilik Siyasətini</a> qəbul edirsiniz.
                        </p>
                    </form>
                    <button
                        className="btn checkout"
                        onClick={handleCheckout}
                        disabled={empty || sending}
                        style={{ opacity: empty || sending ? 0.5 : 1 }}
                    >
                        {sending ? "Göndərilir..." : "Sifariş et"}
                    </button>
                    <button className="clear-cart" onClick={onClear}>Səbəti təmizlə</button>
                </div>
            </aside>
        </>
    );
}
