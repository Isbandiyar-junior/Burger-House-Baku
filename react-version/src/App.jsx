import { useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import HomePage from "./components/HomePage.jsx";
import CareersPage from "./components/CareersPage.jsx";
import CartPanel from "./components/CartPanel.jsx";
import Toast from "./components/Toast.jsx";
import Footer from "./components/Footer.jsx";
import { postJson } from "./api.js";

// Səbəti brauzerdən oxu (səhifə yenilənəndə itməsin)
function loadCart() {
    try {
        return JSON.parse(localStorage.getItem("bhb-cart")) || [];
    } catch {
        return [];
    }
}

// Sadə "router": #/careers olarsa işə qəbul səhifəsi göstərilir
function getPage() {
    return window.location.hash.startsWith("#/careers") ? "careers" : "home";
}

export default function App() {
    const [page, setPage] = useState(getPage);
    const [cart, setCart] = useState(loadCart);
    const [cartOpen, setCartOpen] = useState(false);
    const [toast, setToast] = useState("");
    const toastTimer = useRef(null);

    // Səhifə dəyişəndə (#/careers <-> #home)
    useEffect(() => {
        const onHashChange = () => setPage(getPage());
        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    // Səbət dəyişəndə yadda saxla
    useEffect(() => {
        try {
            localStorage.setItem("bhb-cart", JSON.stringify(cart));
        } catch {
            // localStorage işləməsə, səbət sadəcə yaddaşda qalır
        }
    }, [cart]);

    // Escape düyməsi səbəti bağlayır
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setCartOpen(false);
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    function showToast(message) {
        setToast(message);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(""), 2000);
    }

    function addToCart(item) {
        setCart((old) => {
            const existing = old.find((i) => i.name === item.name);
            if (existing) {
                return old.map((i) => (i.name === item.name ? { ...i, qty: i.qty + 1 } : i));
            }
            return [...old, { name: item.name, price: item.price, qty: 1 }];
        });
        showToast("✅ " + item.name + " səbətə əlavə olundu");
    }

    function changeQty(name, amount) {
        setCart((old) =>
            old
                .map((i) => (i.name === name ? { ...i, qty: i.qty + amount } : i))
                .filter((i) => i.qty > 0)
        );
    }

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const count = cart.reduce((sum, i) => sum + i.qty, 0);

    // Sifariş Express serverə göndərilir. Xəta olarsa, xəta mətnini qaytarır.
    async function checkout(customer) {
        if (cart.length === 0) return "Səbət boşdur.";
        const result = await postJson("/api/orders", {
            items: cart.map((i) => ({ name: i.name, qty: i.qty })),
            customer,
        });
        if (!result.ok) return Object.values(result.errors).join(" ");

        setCart([]);
        setCartOpen(false);
        showToast("🎉 Sifariş " + result.id + " qəbul olundu! Cəmi: " + result.total.toFixed(2) + " AZN");
        return null;
    }

    return (
        <>
            <Header page={page} count={count} onCartClick={() => setCartOpen(true)} />

            {page === "careers" ? <CareersPage /> : <HomePage onAdd={addToCart} />}

            <CartPanel
                open={cartOpen}
                cart={cart}
                total={total}
                onClose={() => setCartOpen(false)}
                onChangeQty={changeQty}
                onClear={() => setCart([])}
                onCheckout={checkout}
            />
            <Toast message={toast} />
            <Footer />
        </>
    );
}
