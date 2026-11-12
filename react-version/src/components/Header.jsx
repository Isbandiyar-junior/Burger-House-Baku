import { useEffect, useState } from "react";

const links = [
    { href: "#home", label: "Ana səhifə" },
    { href: "#burgers", label: "Burgerlərimiz" },
    { href: "#foods", label: "Digər yeməklər" },
    { href: "#drinks", label: "İçkilər" },
    { href: "#combos", label: "Kombolar" },
    { href: "#branches", label: "Ünvanlarımız" },
];

export default function Header({ page, count, onCartClick }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [active, setActive] = useState("home");
    const [bump, setBump] = useState(false);

    // Səbət sayı dəyişəndə kiçik animasiya
    useEffect(() => {
        if (count === 0) return;
        setBump(true);
        const t = setTimeout(() => setBump(false), 300);
        return () => clearTimeout(t);
    }, [count]);

    // Scroll zamanı aktiv bölməni tap
    useEffect(() => {
        if (page !== "home") return;
        function onScroll() {
            let current = "home";
            document.querySelectorAll("main section[id]").forEach((section) => {
                if (window.scrollY >= section.offsetTop - 150) current = section.id;
            });
            setActive(current);
        }
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [page]);

    return (
        <header>
            <a href="#home">
                <img src="logo.jpeg" alt="logo BHB" className="logo" />
            </a>
            <button className="menu-toggle" aria-label="Menyu" onClick={() => setMenuOpen(!menuOpen)}>
                ☰
            </button>
            <nav className={"navbar" + (menuOpen ? " open" : "")}>
                {links.map((link) => (
                    <a
                        key={link.href}
                        href={link.href}
                        className={page === "home" && active === link.href.slice(1) ? "active" : ""}
                        onClick={() => setMenuOpen(false)}
                    >
                        {link.label}
                    </a>
                ))}
                <a
                    href="#/careers"
                    className={page === "careers" ? "active" : ""}
                    onClick={() => setMenuOpen(false)}
                >
                    İşə qəbul
                </a>
            </nav>
            <button className="cart" onClick={onCartClick}>
                🛒 Səbət <span className={"cart-count" + (bump ? " bump" : "")}>{count}</span>
            </button>
        </header>
    );
}
