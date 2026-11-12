// Verilənlər bazasını hazırlayır:
//   1) "baku_burger" bazası yoxdursa, yaradır
//   2) cədvəlləri yaradır (db/schema.sql)
//   3) menyunu data/menu.json-dan bazaya yazır (qiymət dəyişibsə, yeniləyir)
// İşə salmaq: npm run db:setup

import pg from "pg";
import { readFile } from "node:fs/promises";

try {
    process.loadEnvFile(new URL("../.env", import.meta.url));
} catch {
    // .env yoxdursa, sistem dəyişənlərindən istifadə olunur
}

const dbName = process.env.PGDATABASE || "baku_burger";

// 1) Bazanı yarat (əvvəlcə standart "postgres" bazasına qoşuluruq)
const admin = new pg.Client({ database: "postgres" });
await admin.connect();
const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
if (exists.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${dbName.replace(/"/g, "")}"`);
    console.log(`✅ "${dbName}" bazası yaradıldı`);
} else {
    console.log(`ℹ️  "${dbName}" bazası artıq var`);
}
await admin.end();

// 2) Cədvəlləri yarat
const client = new pg.Client({ database: dbName });
await client.connect();
const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf-8");
await client.query(schema);
console.log("✅ Cədvəllər hazırdır: menu_items, orders, order_items, applications");

// 3) Menyunu yaz
const menu = JSON.parse(await readFile(new URL("../data/menu.json", import.meta.url), "utf-8"));
let count = 0;
await client.query("BEGIN");
for (const [category, items] of Object.entries(menu)) {
    for (const item of items) {
        await client.query(
            `INSERT INTO menu_items (name, category, price, image)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (name) DO UPDATE
             SET category = EXCLUDED.category, price = EXCLUDED.price, image = EXCLUDED.image, is_active = TRUE`,
            [item.name, category, item.price, item.image]
        );
        count++;
    }
}
await client.query("COMMIT");
console.log(`✅ Menyu yazıldı: ${count} məhsul`);

await client.end();
