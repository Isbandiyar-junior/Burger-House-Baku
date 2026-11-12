// ================= ADMIN PANELİ =================
// Sifarişlər hər 10 saniyədən bir avtomatik yenilənir.

const REFRESH_MS = 10000;
const STATUS_CLASS = {
    "qəbul olundu": "s-qebul",
    "hazırlanır": "s-hazir",
    "yoldadır": "s-yolda",
    "çatdırıldı": "s-catdi",
    "ləğv edildi": "s-legv",
};

const loginBox = document.getElementById("loginBox");
const panel = document.getElementById("panel");
const toast = document.getElementById("toast");

let statuses = Object.keys(STATUS_CLASS);
let currentFilter = null; // null = hamısı
let knownOrderIds = null; // ilk yükləmədə "yeni sifariş" bildirişi göstərməmək üçün
let refreshTimer = null;

// ================= KÖMƏKÇİLƏR =================

// Element yaratmaq üçün qısa funksiya. Mətn həmişə textContent ilə yazılır (XSS-dən qorunma)
function el(tag, props, children) {
    const node = document.createElement(tag);
    Object.assign(node, props || {});
    (children || []).forEach(function (child) {
        node.append(child);
    });
    return node;
}

function formatTime(iso) {
    return new Date(iso).toLocaleString("az-AZ", {
        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}

// Yeni sifariş gələndə qısa səs siqnalı
function beep() {
    try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        osc.frequency.value = 880;
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
        // səs işləməsə, problem deyil
    }
}

async function api(url, options) {
    try {
        const response = await fetch(url, Object.assign({ headers: { "Content-Type": "application/json" } }, options));
        const data = await response.json();
        if (response.status === 401 && !url.endsWith("/login")) {
            showLogin();
        }
        return data;
    } catch (e) {
        return { ok: false, errors: { server: "Server ilə əlaqə yoxdur." } };
    }
}

// ================= GİRİŞ =================

function showLogin() {
    clearInterval(refreshTimer);
    panel.hidden = true;
    loginBox.hidden = false;
    document.getElementById("password").focus();
}

function showPanel() {
    loginBox.hidden = true;
    panel.hidden = false;
    knownOrderIds = null;
    refreshAll();
    clearInterval(refreshTimer);
    refreshTimer = setInterval(refreshAll, REFRESH_MS);
}

document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const input = document.getElementById("password");
    const error = document.getElementById("loginError");
    const result = await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password: input.value }),
    });
    if (result.ok) {
        input.value = "";
        error.textContent = "";
        showPanel();
    } else {
        error.textContent = result.errors.server;
    }
});

document.getElementById("logoutBtn").addEventListener("click", async function () {
    await api("/api/admin/logout", { method: "POST" });
    showLogin();
});

// ================= MƏLUMATLARI YÜKLƏ =================

async function refreshAll() {
    const live = document.getElementById("liveStatus");
    const [stats, orders] = await Promise.all([loadStats(), loadOrders()]);
    if (stats && orders) {
        live.textContent = "● Canlı · " + new Date().toLocaleTimeString("az-AZ");
        live.style.color = "#8fff8f";
    } else {
        live.textContent = "● Əlaqə yoxdur";
        live.style.color = "#ff5c5c";
    }
    if (!document.getElementById("applicationsTab").hidden) loadApplications();
}

async function loadStats() {
    const s = await api("/api/admin/stats");
    if (!s.ok) return false;
    document.getElementById("statToday").textContent = s.today_orders;
    document.getElementById("statRevenue").textContent = Number(s.today_revenue).toFixed(2) + " AZN";
    document.getElementById("statActive").textContent = s.active_orders;
    document.getElementById("statApps").textContent = s.applications;
    return true;
}

async function loadOrders() {
    const url = "/api/admin/orders" + (currentFilter ? "?status=" + encodeURIComponent(currentFilter) : "");
    const result = await api(url);
    if (!result.ok) return false;
    statuses = result.statuses;
    renderFilters();

    // Yeni sifarişləri tap (yalnız "hamısı" görünüşündə)
    const ids = result.orders.map(function (o) { return o.id; });
    let newIds = [];
    if (!currentFilter) {
        if (knownOrderIds) {
            newIds = ids.filter(function (id) { return !knownOrderIds.has(id); });
        }
        knownOrderIds = new Set(ids);
    }
    if (newIds.length > 0) {
        beep();
        showToast("🔔 " + newIds.length + " yeni sifariş!");
    }

    // Admin statusu seçərkən siyahını yeniləmə (açıq menyu bağlanmasın)
    const busy = document.activeElement && document.activeElement.tagName === "SELECT";
    if (!busy || newIds.length > 0) {
        renderOrders(result.orders, new Set(newIds));
    }
    return true;
}

async function loadApplications() {
    const result = await api("/api/admin/applications");
    if (!result.ok) return;
    const list = document.getElementById("appList");
    list.replaceChildren();

    if (result.applications.length === 0) {
        list.append(el("div", { className: "empty", textContent: "Hələ müraciət yoxdur." }));
        return;
    }

    result.applications.forEach(function (a) {
        list.append(el("div", { className: "app-card" }, [
            el("h3", { textContent: a.position + " — " + a.full_name }),
            el("p", { textContent: "📞 " + a.phone + "   ✉️ " + a.email }),
            el("p", { textContent: "🕒 " + formatTime(a.created_at) }),
            a.about ? el("p", { textContent: "💬 " + a.about }) : "",
        ]));
    });
}

// ================= GÖSTƏR =================

function renderFilters() {
    const box = document.getElementById("filters");
    box.replaceChildren();
    [null].concat(statuses).forEach(function (status) {
        const chip = el("button", {
            className: "chip" + (status === currentFilter ? " active" : ""),
            textContent: status || "Hamısı",
        });
        chip.addEventListener("click", function () {
            currentFilter = status;
            loadOrders();
        });
        box.append(chip);
    });
}

function renderOrders(orders, newIds) {
    const list = document.getElementById("orderList");
    list.replaceChildren();

    if (orders.length === 0) {
        list.append(el("div", { className: "empty", textContent: "Bu statusda sifariş yoxdur." }));
        return;
    }

    orders.forEach(function (order) {
        const select = el("select", { title: "Statusu dəyiş" });
        statuses.forEach(function (s) {
            select.append(el("option", { value: s, textContent: s, selected: s === order.status }));
        });
        select.addEventListener("change", async function () {
            const result = await api("/api/admin/orders/" + encodeURIComponent(order.id), {
                method: "PATCH",
                body: JSON.stringify({ status: select.value }),
            });
            if (result.ok) {
                showToast("✅ " + order.id + " → " + select.value);
                refreshAll();
            } else {
                showToast("❌ " + (Object.values(result.errors)[0] || "Xəta"));
                select.value = order.status;
            }
        });

        const items = el("ul", {}, order.items.map(function (i) {
            return el("li", { textContent: i.qty + " × " + i.name + "  (" + (i.price * i.qty).toFixed(2) + " AZN)" });
        }));

        const card = el("div", {
            className: "order " + (STATUS_CLASS[order.status] || "") + (newIds.has(order.id) ? " new" : ""),
        }, [
            el("div", {}, [
                el("div", { className: "order-head" }, [
                    el("strong", { textContent: order.id }),
                    el("time", { textContent: formatTime(order.created_at) }),
                ]),
                el("p", { textContent: "👤 " + order.customer_name + "   📞 " + order.phone }),
                el("p", { textContent: "📍 " + order.address }),
                items,
            ]),
            el("div", { className: "order-side" }, [
                el("div", { className: "order-total", textContent: Number(order.total).toFixed(2) + " AZN" }),
                select,
            ]),
        ]);
        list.append(card);
    });
}

// ================= TABLAR =================

document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
        document.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        const showApps = tab.dataset.tab === "applications";
        document.getElementById("ordersTab").hidden = showApps;
        document.getElementById("applicationsTab").hidden = !showApps;
        if (showApps) loadApplications();
    });
});

// ================= BAŞLA =================

api("/api/admin/me").then(function (result) {
    if (result.ok) showPanel();
    else showLogin();
});
