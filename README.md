# 🍔 Burger House Baku

Bakıda yerləşən **uydurma** burger restoranı üçün tam veb sayt: menyu, səbət, onlayn sifariş, işə qəbul forması və sifarişləri idarə etmək üçün admin paneli.

> ℹ️ Bu, təhsil məqsədilə hazırlanmış nümunə layihədir. Burger House Baku real şirkət deyil; ünvanlar, telefon nömrələri və e-poçt uydurmadır.

*A full-stack demo website for a fictional burger restaurant in Baku — HTML/CSS/JavaScript frontend, a React version, a Node.js + Express backend and a PostgreSQL database. The site content is in Azerbaijani.*

---

## ✨ Xüsusiyyətlər

**Müştəri üçün**
- 6 burger, 8 qəlyanaltı, 8 içki və 4 kombo — şəkillər, təsvirlər və qiymətlərlə
- Səbət: məhsul əlavə et, sayı dəyiş, cəmi gör (səhifə yenilənəndə itmir)
- Ad, telefon və ünvanla onlayn sifariş — sifariş nömrəsi dərhal göstərilir
- İşə qəbul səhifəsi (aşpaz, kassir, kuryer) və müraciət forması
- Filial ünvanları, Məxfilik Siyasəti və İstifadə Şərtləri
- Telefona uyğun dizayn və mobil menyu

**Restoran üçün (admin paneli)**
- Yeni sifarişlər hər 10 saniyədən bir avtomatik görünür, səs siqnalı ilə
- Status bir kliklə dəyişir: qəbul olundu → hazırlanır → yoldadır → çatdırıldı (və ya ləğv edildi)
- Statusa görə filtr, bugünkü sifariş sayı və gəlir
- İş müraciətlərinin siyahısı
- Parol ilə giriş, 5 səhv cəhddən sonra 15 dəqiqəlik blok

**Təhlükəsizlik**
- Qiymətlər həmişə serverdə, bazadan hesablanır — brauzerdə qiyməti dəyişmək olmaz
- Bütün formalar həm brauzerdə, həm serverdə yoxlanılır
- Sifariş və onun məhsulları bir tranzaksiyada yazılır
- Parollar `.env` faylında saxlanılır və GitHub-a getmir
- Server yalnız saytın öz fayllarını paylaşır (`server.js`, `.env`, `db/` gizli qalır)

## 🛠 Texnologiyalar

| Hissə | Texnologiya |
|---|---|
| Frontend | HTML, CSS, JavaScript (framework-süz) |
| Frontend (alternativ) | React 18 + Vite |
| Backend | Node.js + Express 5 |
| Verilənlər bazası | PostgreSQL 17 (`pg` paketi ilə) |

## 📁 Qovluq quruluşu

```
├── index.html          Ana səhifə: menyu, içkilər, kombolar, ünvanlar, səbət
├── careers.html        İşə qəbul səhifəsi
├── privacy.html        Məxfilik Siyasəti
├── terms.html          İstifadə Şərtləri
├── admin.html          Admin paneli
├── admin-panel.js      Admin panelinin JavaScript-i
├── style.css           Bütün səhifələrin dizaynı
├── script.js           Səbət, sifariş və forma məntiqi
├── burgers/, food/     Məhsul şəkilləri
│
├── server.js           Express server və API
├── routes/admin.js     Admin API-si (giriş, sifarişlər, statuslar)
├── db/
│   ├── schema.sql      Cədvəllər
│   ├── setup.js        Bazanı, cədvəlləri və menyunu yaradır
│   └── pool.js         PostgreSQL bağlantısı
├── data/menu.json      Başlanğıc menyu (ad, kateqoriya, qiymət, şəkil)
├── .env.example        Parametrlər üçün nümunə
│
└── react-version/      Eyni saytın React versiyası
```

## 🚀 Quraşdırma və işə salma

**Lazım olanlar:** [Node.js](https://nodejs.org/) 20+ və [PostgreSQL](https://www.postgresql.org/download/) 14+

1. Layihəni yükləyin:
   ```bash
   git clone https://github.com/Isbandiyar-junior/baku-burger-house.git
   cd baku-burger-house
   ```

2. `.env.example` faylını `.env` adı ilə kopyalayın və öz parollarınızı yazın:
   ```
   PGPASSWORD=postgresql-parolunuz
   ADMIN_PASSWORD=admin-paneli-üçün-parol
   ```

3. Paketləri quraşdırın və bazanı hazırlayın:
   ```bash
   npm install
   npm run db:setup
   ```
   `db:setup` bazanı, cədvəlləri və menyunu yaradır. Onu təkrar işə salmaq təhlükəsizdir — mövcud sifarişlər silinmir.

4. Serveri işə salın:
   ```bash
   npm start
   ```

| Səhifə | Ünvan |
|---|---|
| Sayt | http://localhost:3000 |
| Admin paneli | http://localhost:3000/admin |
| React versiyası | http://localhost:3000/react *(əvvəlcə `npm run build:react`)* |

> **Windows:** `npm` "running scripts is disabled" xətası verirsə, `npm.cmd start` yazın və ya bir dəfə `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` işə salın.

Serveri dayandırmaq üçün terminalda **Ctrl+C** basın. Məlumatlar PostgreSQL-də qalır.

## 🔌 API

| Metod | Ünvan | Təsvir |
|---|---|---|
| GET | `/api/menu` | Bütün menyu, kateqoriyalara görə |
| POST | `/api/orders` | Yeni sifariş: `{ items: [{ name, qty }], customer: { name, phone, address } }` |
| POST | `/api/careers` | İş müraciəti: `{ fullName, phone, email, position, about }` |
| POST | `/api/admin/login` | Admin girişi: `{ password }` |
| GET | `/api/admin/orders` | Son 200 sifariş, `?status=hazırlanır` ilə filtr |
| PATCH | `/api/admin/orders/:id` | Statusu dəyiş: `{ status }` |
| GET | `/api/admin/stats` | Bugünkü sifarişlər, gəlir, aktiv sifarişlər |
| GET | `/api/admin/applications` | İş müraciətləri |
| POST | `/api/admin/logout` | Çıxış |

Bütün `/api/admin/*` ünvanları (girişdən başqa) admin girişi tələb edir.

## 🗄 Verilənlər bazası

| Cədvəl | Nə saxlayır |
|---|---|
| `menu_items` | Məhsullar: ad, kateqoriya, qiymət, şəkil |
| `orders` | Sifarişlər: müştəri, telefon, ünvan, cəmi, status, tarix |
| `order_items` | Hər sifarişin məhsulları, sifariş anındakı qiymətlə |
| `applications` | İşə qəbul müraciətləri |

**Menyunu dəyişmək:** məhsulu və ya qiyməti həm `index.html`-də, həm də `data/menu.json`-da eyni adla yazın, sonra `npm run db:setup` işə salın.

## ⚛️ React versiyası

Eyni saytın komponentlərə bölünmüş versiyası `react-version/` qovluğundadır. Menyu məlumatları `react-version/src/data.js`-dədir.

İnkişaf rejimində işlətmək (iki terminal):
```bash
npm start                         # 1-ci terminal: Express server
cd react-version && npm run dev   # 2-ci terminal: http://localhost:5173
```
`/api` sorğuları avtomatik olaraq Express serverə yönləndirilir.

## 👤 Müəllif

**Isbandiyar Junior** — [github.com/Isbandiyar-junior](https://github.com/Isbandiyar-junior)
