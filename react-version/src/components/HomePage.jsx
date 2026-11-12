import { useEffect } from "react";
import { burgers, foods, drinks, combos, branches } from "../data.js";
import MenuCard from "./MenuCard.jsx";

function formatPrice(price) {
    return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

export default function HomePage({ onAdd }) {
    // Başqa səhifədən "#burgers" kimi linklə gəldikdə həmin bölməyə sürüşdür
    useEffect(() => {
        const id = window.location.hash.slice(1);
        if (id) document.getElementById(id)?.scrollIntoView();
    }, []);

    return (
        <main>
            <section id="home" className="main_part">
                <div className="main-content">
                    <p className="subtitle">FRESH • HOT • LOCAL</p>
                    <h1>
                        Ac olanda
                        <br />
                        Burger House Baku var.
                    </h1>
                    <p>Təzə hazırlanmış burgerlər, xırtıldayan kartof və özəl souslar.</p>
                    <a href="#burgers" className="btn">Menyuya bax</a>
                </div>
            </section>

            <section id="burgers" className="burgers">
                <h2>Burgerlərimiz</h2>
                <div className="burger-container">
                    {burgers.map((item) => (
                        <MenuCard key={item.name} item={item} type="burger" onAdd={onAdd} />
                    ))}
                </div>
            </section>

            <section id="foods" className="foods">
                <h2>Digər yeməklər</h2>
                <div className="food-container">
                    {foods.map((item) => (
                        <MenuCard key={item.name} item={item} type="food" onAdd={onAdd} />
                    ))}
                </div>
            </section>

            <section id="drinks" className="drinks">
                <h2>İçkilər</h2>
                <div className="drink-container">
                    {drinks.map((item) => (
                        <div className="drink-card" key={item.name}>
                            <img src={item.image} alt={item.name} className="drink-photo" loading="lazy" />
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                            <div className="drink-bs">
                                <strong>{formatPrice(item.price)} AZN</strong>
                                <button className="add" onClick={() => onAdd(item)}>+</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="combos" className="combos">
                <h2>Kombolar</h2>
                <div className="combo-container">
                    {combos.map((item) => (
                        <div className="combo-card" key={item.name}>
                            <span className="badge">{item.badge}</span>
                            <img src={item.image} alt={item.name} className="combo-photo" loading="lazy" />
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                            <p className="old-price">{item.oldPrice} AZN</p>
                            <div className="combo-bs">
                                <strong>{formatPrice(item.price)} AZN</strong>
                                <button className="add" onClick={() => onAdd(item)}>+</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="branches" className="branches">
                <h2>Ünvanlarımız</h2>
                <div className="branch-container">
                    {branches.map((b) => (
                        <div className="branch-card" key={b.name}>
                            <h3>📍 {b.name}</h3>
                            <p>{b.address}</p>
                            <p>🕒 {b.hours}</p>
                            <p>📞 {b.phone}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="careers" className="careers">
                <h2>Bizimlə işləmək istəyirsən?</h2>
                <p>Komandamıza enerjili aşpazlar, kassirlər və kuryerlər axtarırıq.</p>
                <a href="#/careers" className="btn">Müraciət et</a>
            </section>
        </main>
    );
}
