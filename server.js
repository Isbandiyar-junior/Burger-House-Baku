// Burger House Baku - Node.js + Express + PostgreSQL server
// İşə salmaq:  npm install  →  npm run db:setup  →  npm start  →  http://localhost:3000

import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { pool } from "./db/pool.js";
import adminRouter from "./routes/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: "20kb" }));

// ================= KÖMƏKÇİ FUNKSİYALAR =================

const serverError = (res) =>
    res.status(500).json({ ok: false, errors: { server: "Server xətası. Yenidən cəhd edin." } });

// Unikal və təxmin edilməsi çətin nömrə, məs: BHB-MWCR08-7F3K9Q
function makeId(prefix) {
    const random = crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
    return prefix + "-" + Date.now().toString(36).toUpperCase() + "-" + random;
}

// Telefon: boşluq və tirelər nəzərə alınmır, 9-15 rəqəm olmalıdır (məs: +994 50 123 45 67)
const isPhone = (value) => /^\+?\d{9,15}$/.test(value.replace(/[\s-]/g, ""));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const JOBS = ["Aşpaz", "Kassir", "Kuryer"];

// ================= API =================

// Bütün menyu (PostgreSQL-dən, kateqoriyalara bölünmüş)
app.get("/api/menu", async (req, res) => {
    try {
        const { rows } = await pool.query(
            "SELECT name, category, price, image FROM menu_items WHERE is_active ORDER BY id"
        );
        const menu = { burgers: [], foods: [], drinks: [], combos: [] };
        for (const row of rows) {
            menu[row.category].push({ name: row.name, price: row.price, image: row.image });
        }
        res.json(menu);
    } catch (err) {
        console.error("Menyu oxuna bilmədi:", err.message);
        serverError(res);
    }
});

// Sifariş vermək
app.post("/api/orders", async (req, res) => {
    const { items, customer } = req.body || {};
    const errors = {};

    // Qiymətlər həmişə bazadan götürülür (istifadəçi qiyməti dəyişə bilməsin)
    let menuRows = new Map();
    if (!Array.isArray(items) || items.length === 0) {
        errors.items = "Səbət boşdur.";
    } else if (items.length > 50) {
        errors.items = "Səbətdə çox məhsul var.";
    } else {
        try {
            const names = items.map((item) => String(item?.name));
            const { rows } = await pool.query(
                "SELECT id, name, price FROM menu_items WHERE is_active AND name = ANY($1)",
                [names]
            );
            menuRows = new Map(rows.map((row) => [row.name, row]));
        } catch (err) {
            console.error("Menyu oxuna bilmədi:", err.message);
            return serverError(res);
        }

        for (const item of items) {
            if (!menuRows.has(item?.name)) {
                errors.items = "Menyuda olmayan məhsul: " + String(item?.name).slice(0, 50);
                break;
            }
            if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > 50) {
                errors.items = "Yanlış say: " + item.name;
                break;
            }
        }
    }

    const name = String(customer?.name || "").trim();
    const phone = String(customer?.phone || "").trim();
    const address = String(customer?.address || "").trim();
    if (name.length < 2 || name.length > 60) errors.name = "Adınızı daxil edin.";
    if (!isPhone(phone)) errors.phone = "Düzgün telefon nömrəsi daxil edin.";
    if (address.length < 5 || address.length > 200) errors.address = "Ünvanı daxil edin.";

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ ok: false, errors });
    }

    const orderItems = items.map((item) => {
        const row = menuRows.get(item.name);
        return { menuItemId: row.id, name: row.name, price: row.price, qty: item.qty };
    });
    const total = Math.round(orderItems.reduce((sum, i) => sum + i.price * i.qty, 0) * 100) / 100;
    const orderId = makeId("BHB");

    // Sifariş və onun məhsulları bir "transaction" daxilində yazılır: ya hamısı, ya heç biri
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(
            "INSERT INTO orders (id, customer_name, phone, address, total) VALUES ($1, $2, $3, $4, $5)",
            [orderId, name, phone, address, total]
        );
        for (const item of orderItems) {
            await client.query(
                "INSERT INTO order_items (order_id, menu_item_id, name, price, qty) VALUES ($1, $2, $3, $4, $5)",
                [orderId, item.menuItemId, item.name, item.price, item.qty]
            );
        }
        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Sifariş yazıla bilmədi:", err.message);
        return serverError(res);
    } finally {
        client.release();
    }

    console.log(`🍔 Yeni sifariş ${orderId}: ${total} AZN`);
    res.status(201).json({ ok: true, id: orderId, total });
});

// İşə qəbul müraciəti
app.post("/api/careers", async (req, res) => {
    const body = req.body || {};
    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const position = String(body.position || "");
    const about = String(body.about || "").trim().slice(0, 1000);

    const errors = {};
    if (fullName.length < 3 || fullName.length > 80) errors.fullName = "Ad və soyadınızı daxil edin.";
    if (!isPhone(phone)) errors.phone = "Düzgün telefon nömrəsi daxil edin.";
    if (!EMAIL_RE.test(email) || email.length > 100) errors.email = "Düzgün e-poçt daxil edin.";
    if (!JOBS.includes(position)) errors.position = "Vəzifə seçin.";

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ ok: false, errors });
    }

    const applicationId = makeId("JOB");

    try {
        await pool.query(
            "INSERT INTO applications (id, full_name, phone, email, position, about) VALUES ($1, $2, $3, $4, $5, $6)",
            [applicationId, fullName, phone, email, position, about || null]
        );
    } catch (err) {
        console.error("Müraciət yazıla bilmədi:", err.message);
        return serverError(res);
    }

    console.log(`📝 Yeni müraciət ${applicationId}: ${position}`);
    res.status(201).json({ ok: true, id: applicationId });
});

// Admin paneli API-si (routes/admin.js)
app.use("/api/admin", adminRouter);

// Naməlum API ünvanları
app.use("/api", (req, res) => {
    res.status(404).json({ ok: false, errors: { server: "Belə API yoxdur." } });
});

// ================= SAYT FAYLLARI =================
// Yalnız saytın özünə aid fayllar paylaşılır (server.js, data/ və s. gizli qalır)

const sendPage = (file) => (req, res) => res.sendFile(path.join(__dirname, file));
app.get("/", sendPage("index.html"));
app.get("/index.html", sendPage("index.html"));
app.get("/careers.html", sendPage("careers.html"));
app.get("/privacy.html", sendPage("privacy.html"));
app.get("/terms.html", sendPage("terms.html"));
app.get("/style.css", sendPage("style.css"));
app.get("/script.js", sendPage("script.js"));
app.get("/logo.jpeg", sendPage("logo.jpeg"));
app.get("/admin", sendPage("admin.html"));
app.get("/admin-panel.js", sendPage("admin-panel.js"));
app.use("/burgers", express.static(path.join(__dirname, "burgers")));
app.use("/food", express.static(path.join(__dirname, "food")));

// React versiyası (əvvəlcə: npm run build:react)
const reactDist = path.join(__dirname, "react-version", "dist");
app.use("/react", express.static(reactDist));
app.get("/react", (req, res) => {
    if (existsSync(path.join(reactDist, "index.html"))) {
        res.sendFile(path.join(reactDist, "index.html"));
    } else {
        res.status(404).send("React versiyası hələ build olunmayıb. Əvvəlcə: npm run build:react");
    }
});

// 404 səhifəsi
app.use((req, res) => {
    res.status(404).send("<h1 style='font-family:Arial;color:#ff8c00;background:#000;padding:40px'>404 – Səhifə tapılmadı</h1><p style='font-family:Arial;padding:0 40px'><a href='/'>Ana səhifəyə qayıt</a></p>");
});

// Başlamazdan əvvəl PostgreSQL bağlantısını yoxla
try {
    const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM menu_items");
    console.log(`🐘 PostgreSQL qoşuldu: ${rows[0].count} məhsul menyuda`);
} catch (err) {
    console.error("❌ PostgreSQL-ə qoşulmaq olmadı:", err.message);
    if (err.code === "42P01" || err.code === "3D000") {
        console.error("   Baza və ya cədvəllər yoxdur. Əvvəlcə işə salın: npm run db:setup");
    } else {
        console.error("   PostgreSQL işləyirmi və .env faylındakı parametrlər düzgündürmü? (PGHOST, PGUSER, PGPASSWORD)");
    }
    process.exit(1);
}

app.listen(PORT, (error) => {
    if (error) {
        if (error.code === "EADDRINUSE") {
            console.error(`❌ ${PORT} portu artıq istifadə olunur. Başqa terminalda server açıq qalıb, onu bağlayın.`);
        } else {
            console.error("❌ Server başlaya bilmədi:", error);
        }
        process.exit(1);
    }
    console.log(`✅ Burger House Baku server işləyir: http://localhost:${PORT}`);
    console.log(`   React versiyası:              http://localhost:${PORT}/react`);
    console.log(`   Admin paneli:                 http://localhost:${PORT}/admin`);
    if (!process.env.ADMIN_PASSWORD) {
        console.warn("⚠️  .env faylında ADMIN_PASSWORD yoxdur - admin paneli açılmayacaq.");
    }
});
