// ================= MOBİL MENYU =================
const menuToggle = document.getElementById("menuToggle");
const navbar = document.getElementById("navbar");

if (menuToggle) {
    menuToggle.addEventListener("click", function () {
        navbar.classList.toggle("open");
    });

    // Linkə klik edəndə menyunu bağla
    navbar.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            navbar.classList.remove("open");
        });
    });
}

// ================= TOAST (kiçik bildiriş) =================
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2000);
}

// Telefon: boşluq və tirelər nəzərə alınmır, 9-15 rəqəm olmalıdır (məs: +994 50 123 45 67)
function isPhone(value) {
    return /^\+?\d{9,15}$/.test(value.replace(/[\s-]/g, ""));
}

// ================= SERVERƏ SORĞU =================
// Express serverə JSON göndərir. Server işləmirsə, aydın xəta qaytarır.
async function postJson(url, data) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (e) {
        return {
            ok: false,
            errors: { server: "Server ilə əlaqə yoxdur. Saytı 'npm start' ilə açın: http://localhost:3000" },
        };
    }
}

// ================= SƏBƏT =================
const cartBtn = document.getElementById("cartBtn");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const closeCart = document.getElementById("closeCart");
const cartItemsList = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const checkoutBtn = document.getElementById("checkoutBtn");
const clearCartBtn = document.getElementById("clearCart");

// Səbət brauzerdə saxlanılır ki, səhifə yenilənəndə itməsin
let cart = loadCart();

function loadCart() {
    try {
        return JSON.parse(localStorage.getItem("bhb-cart")) || [];
    } catch (e) {
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem("bhb-cart", JSON.stringify(cart));
    } catch (e) {
        // localStorage işləməsə, səbət sadəcə yaddaşda qalır
    }
}

function addToCart(name, price) {
    const existing = cart.find(function (item) {
        return item.name === name;
    });

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name: name, price: price, qty: 1 });
    }

    saveCart();
    renderCart();
    showToast("✅ " + name + " səbətə əlavə olundu");

    cartCount.classList.remove("bump");
    void cartCount.offsetWidth; // animasiyanı yenidən başlatmaq üçün
    cartCount.classList.add("bump");
}

function changeQty(index, amount) {
    cart[index].qty += amount;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    renderCart();
}

function renderCart() {
    if (!cartItemsList) return;

    cartItemsList.innerHTML = "";
    let total = 0;
    let count = 0;

    cart.forEach(function (item, index) {
        total += item.price * item.qty;
        count += item.qty;

        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML =
            '<div>' +
                '<div class="cart-item-name"></div>' +
                '<div class="cart-item-price">' + (item.price * item.qty).toFixed(2) + ' AZN</div>' +
            '</div>' +
            '<div class="qty">' +
                '<button data-index="' + index + '" data-action="minus">−</button>' +
                '<span>' + item.qty + '</span>' +
                '<button data-index="' + index + '" data-action="plus">+</button>' +
            '</div>';
        li.querySelector(".cart-item-name").textContent = item.name;
        cartItemsList.appendChild(li);
    });

    cartTotal.textContent = total.toFixed(2) + " AZN";
    cartCount.textContent = count;
    cartEmpty.hidden = cart.length > 0;
    checkoutBtn.disabled = cart.length === 0;
    checkoutBtn.style.opacity = cart.length === 0 ? "0.5" : "1";
}

function openCart() {
    cartPanel.classList.add("open");
    overlay.classList.add("show");
}

function hideCart() {
    cartPanel.classList.remove("open");
    overlay.classList.remove("show");
}

if (cartPanel) {
    // Bütün "+" düymələri
    document.querySelectorAll("main .add").forEach(function (button) {
        button.addEventListener("click", function () {
            const card = button.closest("[data-name]");
            const name = card.dataset.name;
            const price = parseFloat(card.dataset.price);
            addToCart(name, price);
        });
    });

    // Səbətdəki + / − düymələri
    cartItemsList.addEventListener("click", function (e) {
        const btn = e.target.closest("button");
        if (!btn) return;
        const index = Number(btn.dataset.index);
        changeQty(index, btn.dataset.action === "plus" ? 1 : -1);
    });

    cartBtn.addEventListener("click", openCart);
    closeCart.addEventListener("click", hideCart);
    overlay.addEventListener("click", hideCart);

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") hideCart();
    });

    clearCartBtn.addEventListener("click", function () {
        cart = [];
        saveCart();
        renderCart();
    });

    const orderError = document.getElementById("orderError");

    // Sifariş Express serverə göndərilir (POST /api/orders)
    checkoutBtn.addEventListener("click", async function () {
        if (cart.length === 0) return;

        const customer = {
            name: document.getElementById("orderName").value.trim(),
            phone: document.getElementById("orderPhone").value.trim(),
            address: document.getElementById("orderAddress").value.trim(),
        };

        // Brauzerdə ilkin yoxlama (server də yenidən yoxlayır)
        if (customer.name.length < 2) return (orderError.textContent = "Adınızı daxil edin.");
        if (!isPhone(customer.phone)) return (orderError.textContent = "Düzgün telefon nömrəsi daxil edin.");
        if (customer.address.length < 5) return (orderError.textContent = "Ünvanı daxil edin.");
        orderError.textContent = "";

        checkoutBtn.disabled = true;
        checkoutBtn.textContent = "Göndərilir...";

        const result = await postJson("/api/orders", {
            items: cart.map(function (item) {
                return { name: item.name, qty: item.qty };
            }),
            customer: customer,
        });

        checkoutBtn.textContent = "Sifariş et";
        checkoutBtn.disabled = false;

        if (!result.ok) {
            orderError.textContent = Object.values(result.errors).join(" ");
            return;
        }

        cart = [];
        saveCart();
        renderCart();
        document.getElementById("orderForm").reset();
        hideCart();
        showToast("🎉 Sifariş " + result.id + " qəbul olundu! Cəmi: " + result.total.toFixed(2) + " AZN");
    });

    renderCart();
}

// ================= AKTİV MENYU LİNKİ (scroll zamanı) =================
const sections = document.querySelectorAll("main section[id]");

if (sections.length && navbar) {
    window.addEventListener("scroll", function () {
        let current = "";
        sections.forEach(function (section) {
            if (window.scrollY >= section.offsetTop - 150) {
                current = section.id;
            }
        });

        navbar.querySelectorAll("a").forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + current);
        });
    });
}

// ================= İŞƏ QƏBUL FORMU (careers.html) =================
const careerForm = document.getElementById("careerForm");

if (careerForm) {
    careerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("fullName");
        const phone = document.getElementById("phone");
        const email = document.getElementById("email");
        const position = document.getElementById("position");
        const about = document.getElementById("about");
        const submitBtn = careerForm.querySelector("button[type=submit]");
        let valid = true;

        function setError(input, message) {
            document.getElementById(input.id + "Error").textContent = message;
            if (message) valid = false;
        }

        setError(name, name.value.trim().length < 3 ? "Ad və soyadınızı daxil edin." : "");
        setError(phone, isPhone(phone.value.trim()) ? "" : "Düzgün telefon nömrəsi daxil edin.");
        setError(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? "" : "Düzgün e-poçt daxil edin.");
        setError(position, position.value === "" ? "Vəzifə seçin." : "");

        if (!valid) return;

        // Müraciət Express serverə göndərilir (POST /api/careers)
        submitBtn.disabled = true;
        submitBtn.textContent = "Göndərilir...";

        const result = await postJson("/api/careers", {
            fullName: name.value.trim(),
            phone: phone.value.trim(),
            email: email.value.trim(),
            position: position.value,
            about: about.value.trim(),
        });

        submitBtn.disabled = false;
        submitBtn.textContent = "Göndər";

        if (!result.ok) {
            // Serverdən gələn xətaları uyğun xanaların altında göstər
            const errors = result.errors || {};
            ["fullName", "phone", "email", "position"].forEach(function (field) {
                document.getElementById(field + "Error").textContent = errors[field] || "";
            });
            if (errors.server) document.getElementById("positionError").textContent = errors.server;
            return;
        }

        const firstName = name.value.trim().split(" ")[0];
        careerForm.innerHTML =
            '<div class="success-msg">Təşəkkürlər, <strong></strong>! Müraciətiniz qəbul olundu. Tezliklə sizinlə əlaqə saxlayacağıq. 🍔</div>';
        careerForm.querySelector("strong").textContent = firstName;
    });
}

// Vakansiya kartındakı "Müraciət et" düyməsi formda vəzifəni seçir
document.querySelectorAll("[data-job]").forEach(function (btn) {
    btn.addEventListener("click", function () {
        const select = document.getElementById("position");
        if (select) select.value = btn.dataset.job;
    });
});
