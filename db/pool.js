// PostgreSQL bağlantısı. Parametrlər .env faylından oxunur (PGHOST, PGUSER, PGPASSWORD, PGDATABASE...)
import pg from "pg";

try {
    process.loadEnvFile(new URL("../.env", import.meta.url));
} catch {
    // .env yoxdursa, sistem dəyişənlərindən istifadə olunur
}

// NUMERIC sütunları JavaScript-də rəqəm kimi gəlsin (default olaraq string gəlir)
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => parseFloat(value));

export const pool = new pg.Pool({ max: 10 });
