// Məxfilik və şərtlər səhifələri Express server tərəfindən verilir (/privacy.html, /terms.html)
export default function Footer() {
    return (
        <footer>
            <div className="footer-logo">Burger House Baku</div>
            <p>📞 +994 12 555 00 00 • ✉️ info@burgerhousebaku.az</p>
            <p className="footer-links">
                <a href="/privacy.html">Məxfilik Siyasəti</a> • <a href="/terms.html">İstifadə Şərtləri</a>
            </p>
            <p>© 2026 Burger House Baku</p>
        </footer>
    );
}
