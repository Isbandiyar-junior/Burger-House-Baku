-- Burger House Baku - PostgreSQL cədvəlləri
-- Bu fayl "npm run db:setup" ilə avtomatik icra olunur. Təkrar işə salmaq təhlükəsizdir.

-- Menyu: bütün məhsullar və qiymətlər
CREATE TABLE IF NOT EXISTS menu_items (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    category    TEXT NOT NULL CHECK (category IN ('burgers', 'foods', 'drinks', 'combos')),
    price       NUMERIC(6, 2) NOT NULL CHECK (price > 0),
    image       TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- Sifarişlər
CREATE TABLE IF NOT EXISTS orders (
    id             TEXT PRIMARY KEY,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    customer_name  TEXT NOT NULL,
    phone          TEXT NOT NULL,
    address        TEXT NOT NULL,
    total          NUMERIC(8, 2) NOT NULL,
    status         TEXT NOT NULL DEFAULT 'qəbul olundu'
);

-- Sifarişin içindəki məhsullar (bir sifarişdə bir neçə məhsul)
CREATE TABLE IF NOT EXISTS order_items (
    id            SERIAL PRIMARY KEY,
    order_id      TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id  INTEGER NOT NULL REFERENCES menu_items(id),
    name          TEXT NOT NULL,          -- sifariş anındakı ad
    price         NUMERIC(6, 2) NOT NULL, -- sifariş anındakı qiymət
    qty           INTEGER NOT NULL CHECK (qty BETWEEN 1 AND 50)
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);

-- İşə qəbul müraciətləri
CREATE TABLE IF NOT EXISTS applications (
    id          TEXT PRIMARY KEY,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    full_name   TEXT NOT NULL,
    phone       TEXT NOT NULL,
    email       TEXT NOT NULL,
    position    TEXT NOT NULL CHECK (position IN ('Aşpaz', 'Kassir', 'Kuryer')),
    about       TEXT
);
