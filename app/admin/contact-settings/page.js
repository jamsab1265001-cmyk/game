
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const platforms = [
    { id: "whatsapp", name: "WhatsApp" },
    { id: "facebook", name: "Facebook" },
    { id: "telegram", name: "Telegram" }
];

const empty = {
    url: "",
    buttonText: "Contact Now",
    isActive: true
};

export default function ContactSettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState({});
    const [saving, setSaving] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const token = sessionStorage.getItem("adminToken");

        if (!token) {
            router.replace("/admin/login");
            return;
        }

        fetch(`${API}/api/contact-settings/admin`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("Unable to load settings");
                return res.json();
            })
            .then((data) => {
                const result = {};

                for (const platform of platforms) {
                    const existing = (data.contacts || []).find(
                        (item) => item.platform === platform.id
                    );

                    result[platform.id] = existing
                        ? {
                            url: existing.url,
                            buttonText: existing.buttonText,
                            isActive: existing.isActive
                        }
                        : { ...empty };
                }

                setSettings(result);
            })
            .catch((err) => setError(err.message));
    }, [router]);

    function update(id, field, value) {
        setSettings((prev) => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    }

    async function save(id) {
        setSaving(id);
        setError("");
        setMessage("");

        try {
            const token = sessionStorage.getItem("adminToken");

            const res = await fetch(`${API}/api/contact-settings/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(settings[id])
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Unable to save");
            }

            setMessage(`${id} settings saved successfully`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving("");
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 p-5 text-white md:p-10">
            <div className="mx-auto max-w-4xl space-y-6">
                <Link
                    href="/admin"
                    className="flex items-center gap-2 text-blue-400"
                >
                    <ArrowLeft size={18} /> Dashboard
                </Link>

                <h1 className="text-3xl font-bold">Contact Settings</h1>

                {error && <p className="text-red-400">{error}</p>}
                {message && <p className="text-green-400">{message}</p>}

                {platforms.map((platform) => {
                    const form = settings[platform.id];
                    if (!form) return null;

                    return (
                        <section
                            key={platform.id}
                            className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-5"
                        >
                            <h2 className="text-xl font-semibold">{platform.name}</h2>

                            <label className="block space-y-2">
                                <span>Contact URL</span>
                                <input
                                    type="url"
                                    value={form.url}
                                    onChange={(e) =>
                                        update(platform.id, "url", e.target.value)
                                    }
                                    placeholder="https://..."
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                                />
                            </label>

                            <label className="block space-y-2">
                                <span>Button Text</span>
                                <input
                                    maxLength={40}
                                    value={form.buttonText}
                                    onChange={(e) =>
                                        update(platform.id, "buttonText", e.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                                />
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) =>
                                        update(platform.id, "isActive", e.target.checked)
                                    }
                                />
                                Active
                            </label>

                            <button
                                type="button"
                                onClick={() => save(platform.id)}
                                disabled={saving === platform.id || !form.url}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold disabled:opacity-50"
                            >
                                <Save size={18} />
                                {saving === platform.id ? "Saving..." : "Save Settings"}
                            </button>
                        </section>
                    );
                })}
            </div>
        </main>
    );
}
