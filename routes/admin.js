// Admin paneli üçün API: giriş, sifarişlər, statuslar, müraciətlər
// Bütün /api/admin/* ünvanları (login-dən başqa) parol ilə qorunur.

import express from "express";
import crypto from "node:crypto";
import { pool } from "../db/pool.js";

export const STATUSES = ["qəbul olundu", "hazırlanır", "yoldadır", "çatdırıldı", "ləğv edildi"];

const COOKIE = "bhb_admin";
const SESSION_HOURS = 8;
const sessions = new Map(); // token -> bitmə vaxtı (server yenidən başlayanda sıfırlanır)
const failedLogins = new Map(); // ip -> { count, until }

const router = express.Router();

// ================= KÖMƏKÇİLƏR =================

function getCookie(req, name) {
    const header = req.headers.cookie || "";
    for (const part of header.split(";")) {
        const [key, ...rest] = part.trim().split("=");
        if (key === name) return decodeURIComponent(rest.join("="));
    }
    return null;
}

// Parolu təhlükəsiz müqayisə et (vaxt fərqindən parolu təxmin etmək olmasın)
function passwordMatches(given) {
    const expected = process.env.ADMIN_PASSWORD || "";
    if (!expected) return false;
    const a = crypto.createHash("sha256").update(String(given)).digest();
    const b = crypto.createHash("sha256").update(expected).digest();
    return crypto.timingSafeEqual(a, b);
}

function isLoggedIn(req) {
    const token = getCookie(req, COOKIE);
    const expires = token && sessions.get(token);
    if (!expires) return false;
    if (Date.now() > expires) {
        sessions.delete(token);
        return false;
    }
    return true;
}

function requireAdmin(req, res, next) {
    if (isLoggedIn(req)) return next();
    res.status(401).json({ ok: false, errors: { server: "Giriş tələb olunur." } });
}

const serverError = (res, err) => {
    console.error("Admin API xətası:", err.message);
    res.status(500).json({ ok: false, errors: { server: "Server xətası." } });
};

// ================= GİRİŞ / ÇIXIŞ =================

router.post("/login", (req, res) => {
    const ip = req.ip;
    const record = failedLogins.get(ip);
    if (record && record.count >= 5 && Date.now() < record.until) {
        return res.status(429).json({ ok: false, errors: { server: "Çox səhv cəhd. 15 dəqiqə sonra yenidən yoxlayın." } });
    }

    if (!passwordMatches(req.body?.password || "")) {
        const count = record && Date.now() < record.until ? record.count + 1 : 1;
        failedLogins.set(ip, { count, until: Date.now() + 15 * 60 * 1000 });
        return res.status(401).json({ ok: false, errors: { server: "Parol səhvdir." } });
    }

    failedLogins.delete(ip);
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, Date.now() + SESSION_HOURS * 60 * 60 * 1000);
    res.setHeader(
        "Set-Cookie",
        `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}`
    );
    res.json({ ok: true });
});

router.post("/logout", (req, res) => {
    const token = getCookie(req, COOKIE);
    if (token) sessions.delete(token);
    res.setHeader("Set-Cookie", `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
    res.json({ ok: true });
});

router.get("/me", (req, res) => {
    res.json({ ok: isLoggedIn(req) });
});

// Bundan sonrakı bütün ünvanlar yalnız giriş edənlər üçündür
router.use(requireAdmin);

// ================= SİFARİŞLƏR =================

// Son sifarişlər (məhsulları ilə birlikdə). ?status=hazırlanır kimi filtr etmək olar
router.get("/orders", async (req, res) => {
    const status = req.query.status;
    const filter = STATUSES.includes(status) ? status : null;
    try {
        const { rows } = await pool.query(
            `SELECT o.id, o.created_at, o.customer_name, o.phone, o.address, o.total, o.status,
                    COALESCE(json_agg(json_build_object('name', i.name, 'qty', i.qty, 'price', i.price)
                             ORDER BY i.id) FILTER (WHERE i.id IS NOT NULL), '[]') AS items
             FROM orders o
             LEFT JOIN order_items i ON i.order_id = o.id
             WHERE ($1::text IS NULL OR o.status = $1)
             GROUP BY o.id
             ORDER BY o.created_at DESC
             LIMIT 200`,
            [filter]
        );
        res.json({ ok: true, orders: rows, statuses: STATUSES });
    } catch (err) {
        serverError(res, err);
    }
});

// Sifarişin statusunu dəyiş
router.patch("/orders/:id", async (req, res) => {
    const status = req.body?.status;
    if (!STATUSES.includes(status)) {
        return res.status(400).json({ ok: false, errors: { status: "Yanlış status." } });
    }
    try {
        const { rowCount } = await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [status, req.params.id]);
        if (rowCount === 0) return res.status(404).json({ ok: false, errors: { server: "Sifariş tapılmadı." } });
        console.log(`📦 ${req.params.id} → ${status}`);
        res.json({ ok: true, id: req.params.id, status });
    } catch (err) {
        serverError(res, err);
    }
});

// ================= STATİSTİKA =================

router.get("/stats", async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT
                COUNT(*) FILTER (WHERE created_at >= date_trunc('day', NOW()))::int AS today_orders,
                COALESCE(SUM(total) FILTER (WHERE created_at >= date_trunc('day', NOW()) AND status <> 'ləğv edildi'), 0) AS today_revenue,
                COUNT(*) FILTER (WHERE status IN ('qəbul olundu', 'hazırlanır', 'yoldadır'))::int AS active_orders,
                (SELECT COUNT(*)::int FROM applications) AS applications
             FROM orders`
        );
        res.json({ ok: true, ...rows[0] });
    } catch (err) {
        serverError(res, err);
    }
});

// ================= MÜRACİƏTLƏR =================

router.get("/applications", async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT id, created_at, full_name, phone, email, position, about
             FROM applications ORDER BY created_at DESC LIMIT 200`
        );
        res.json({ ok: true, applications: rows });
    } catch (err) {
        serverError(res, err);
    }
});

export default router;
