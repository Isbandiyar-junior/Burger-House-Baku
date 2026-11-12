// Express serverə JSON göndərir. Server işləmirsə, aydın xəta qaytarır.
// "npm run dev" zamanı /api sorğuları vite.config.js vasitəsilə localhost:3000-ə yönləndirilir.
export async function postJson(url, data) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch {
        return {
            ok: false,
            errors: { server: "Server ilə əlaqə yoxdur. Əsas qovluqda 'npm start' ilə serveri işə salın." },
        };
    }
}
