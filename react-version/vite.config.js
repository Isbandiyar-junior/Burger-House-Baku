import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    base: "./",
    server: {
        // "npm run dev" zamanı API sorğuları Express serverə (npm start) gedir
        proxy: {
            "/api": "http://localhost:3000",
        },
    },
});
