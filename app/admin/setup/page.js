
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminSetup() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        setupKey: ""
    });

    useEffect(() => {
        fetch(`${API}/api/admin/setup/status`)
            .then((res) => {
                if (!res.ok) throw new Error("Cannot connect to backend");
                return res.json();
            })
            .then((data) => {
                if (!data.setupRequired) {
                    router.replace("/admin/login");
                } else {
                    setLoading(false);
                }
            })
            .catch(() => {
                setError("Backend connection failed");
                setLoading(false);
            });
    }, [router]);

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(`${API}/api/admin/setup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    setupKey: form.setupKey
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Setup failed");
            }

            router.replace("/admin/login");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <main className="min-h-screen bg-slate-950 text-white grid place-items-center">Loading...</main>;
    }

    return (
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-5">
            <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-7 space-y-5">
                <h1 className="text-2xl font-bold">Create Admin Account</h1>

                {error && (
                    <p role="alert" className="rounded-lg bg-red-950 p-3 text-sm text-red-300">{error}</p>
                )}

                {[
                    ["email", "Email", "email"],
                    ["password", "Password", "password"],
                    ["confirmPassword", "Confirm Password", "password"],
                    ["setupKey", "Admin Setup Key", "password"]
                ].map(([key, label, type]) => (
                    <label key={key} className="block space-y-2">
                        <span className="text-sm text-slate-300">{label}</span>
                        <input
                            type={type}
                            required
                            minLength={key === "password" || key === "confirmPassword" ? 12 : undefined}
                            value={form[key]}
                            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
                        />
                    </label>
                ))}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
                >
                    {submitting ? "Creating..." : "Create Admin"}
                </button>
            </form>
        </main>
    );
}
