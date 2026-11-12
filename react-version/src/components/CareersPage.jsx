import { useEffect, useRef, useState } from "react";
import { jobs } from "../data.js";
import { postJson } from "../api.js";

const emptyForm = { fullName: "", phone: "", email: "", position: "", about: "" };

function validate(form) {
    const errors = {};
    if (form.fullName.trim().length < 3) errors.fullName = "Ad və soyadınızı daxil edin.";
    if (!/^\+?\d{9,15}$/.test(form.phone.replace(/[\s-]/g, ""))) errors.phone = "Düzgün telefon nömrəsi daxil edin.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Düzgün e-poçt daxil edin.";
    if (form.position === "") errors.position = "Vəzifə seçin.";
    return errors;
}

export default function CareersPage() {
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [sentName, setSentName] = useState("");
    const [sending, setSending] = useState(false);
    const formRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    function update(field, value) {
        setForm({ ...form, [field]: value });
    }

    function chooseJob(title) {
        update("position", title);
        formRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    // Müraciət Express serverə göndərilir (POST /api/careers)
    async function handleSubmit(e) {
        e.preventDefault();
        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSending(true);
        const result = await postJson("/api/careers", {
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            position: form.position,
            about: form.about.trim(),
        });
        setSending(false);

        if (!result.ok) {
            const serverErrors = { ...result.errors };
            if (serverErrors.server) serverErrors.position = serverErrors.server;
            setErrors(serverErrors);
            return;
        }

        setSentName(form.fullName.trim().split(" ")[0]);
        setForm(emptyForm);
    }

    return (
        <main className="career-page">
            <section>
                <h2>Bizimlə işləmək istəyirsən?</h2>
                <p style={{ color: "#ccc", marginBottom: 30, lineHeight: 1.6 }}>
                    Burger House Baku sürətlə böyüyən komandadır. Gənc, enerjili və dadlı yemək sevən insanları
                    aramızda görmək istəyirik. Çevik iş qrafiki, pulsuz yemək və karyera imkanları sizi gözləyir!
                </p>

                <div className="jobs">
                    {jobs.map((job) => (
                        <div className="job-card" key={job.title}>
                            <h3>{job.icon} {job.title}</h3>
                            <p>{job.description}</p>
                            <p className="salary">{job.salary}</p>
                            <button className="btn" onClick={() => chooseJob(job.title)}>Müraciət et</button>
                        </div>
                    ))}
                </div>

                <h2 ref={formRef}>Müraciət formu</h2>

                {sentName ? (
                    <div className="career-form">
                        <div className="success-msg">
                            Təşəkkürlər, <strong>{sentName}</strong>! Müraciətiniz qəbul olundu. Tezliklə sizinlə əlaqə
                            saxlayacağıq. 🍔
                        </div>
                    </div>
                ) : (
                    <form className="career-form" onSubmit={handleSubmit} noValidate>
                        <label>
                            Ad və soyad
                            <input type="text" placeholder="Məs: Əli Məmmədov" value={form.fullName}
                                onChange={(e) => update("fullName", e.target.value)} />
                        </label>
                        <div className="error">{errors.fullName}</div>

                        <label>
                            Telefon
                            <input type="tel" placeholder="+994 50 123 45 67" value={form.phone}
                                onChange={(e) => update("phone", e.target.value)} />
                        </label>
                        <div className="error">{errors.phone}</div>

                        <label>
                            E-poçt
                            <input type="email" placeholder="ad@mail.com" value={form.email}
                                onChange={(e) => update("email", e.target.value)} />
                        </label>
                        <div className="error">{errors.email}</div>

                        <label>
                            Vəzifə
                            <select value={form.position} onChange={(e) => update("position", e.target.value)}>
                                <option value="">-- Seçin --</option>
                                {jobs.map((job) => (
                                    <option key={job.title} value={job.title}>{job.title}</option>
                                ))}
                            </select>
                        </label>
                        <div className="error">{errors.position}</div>

                        <label>
                            Özünüz haqqında (istəyə bağlı)
                            <textarea rows="4" placeholder="Təcrübəniz, iş qrafiki istəyiniz..." value={form.about}
                                onChange={(e) => update("about", e.target.value)} />
                        </label>

                        <p className="consent">
                            Müraciət göndərməklə məlumatlarınızın{" "}
                            <a href="/privacy.html" target="_blank">Məxfilik Siyasətinə</a> uyğun işlənməsinə razılıq verirsiniz.
                        </p>
                        <button type="submit" className="btn" disabled={sending}>
                            {sending ? "Göndərilir..." : "Göndər"}
                        </button>
                    </form>
                )}
            </section>
        </main>
    );
}
