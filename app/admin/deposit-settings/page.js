
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const emptyForm = {
    method: "Crypto",
    channel: "",
    accountDetails: "",
    accountTitle: "",
    minAmount: 100,
    maxAmount: 100000,
    isActive: true
};

export default function DepositSettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState([]);
    const [form, setForm] = useState({ ...emptyForm });
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function request(path, options = {}) {
        const token = sessionStorage.getItem("adminToken");

        const res = await fetch(`${API}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                ...(options.body ? { "Content-Type": "application/json" } : {})
            }
        });

        const data = await res.json();

        if (res.status === 401 || res.status === 403) {
            router.replace("/admin/login");
            throw new Error("Session expired");
        }

        if (!res.ok) throw new Error(data.message || "Request failed");

        return data;
    }

    async function loadSettings() {
        const data = await request("/api/deposit-settings/admin");
        setSettings(data.settings || []);
    }

    useEffect(() => {
        if (!sessionStorage.getItem("adminToken")) {
            router.replace("/admin/login");
            return;
        }

        loadSettings()
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    function resetForm() {
        setForm({ ...emptyForm });
        setEditingId(null);
    }

    function editSetting(item) {
        setEditingId(item._id);
        setForm({
            method: item.method,
            channel: item.channel,
            accountDetails: item.accountDetails,
            accountTitle: item.accountTitle || "",
            minAmount: item.minAmount,
            maxAmount: item.maxAmount,
            isActive: item.isActive
        });
        setError("");
        setSuccess("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function saveSetting(e) {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await request(
                editingId
                    ? `/api/deposit-settings/${editingId}`
                    : "/api/deposit-settings",
                {
                    method: editingId ? "PUT" : "POST",
                    body: JSON.stringify({
                        ...form,
                        minAmount: Number(form.minAmount),
                        maxAmount: Number(form.maxAmount)
                    })
                }
            );

            setSuccess(editingId ? "Payment method updated" : "Payment method added");
            resetForm();
            await loadSettings();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function deleteSetting(id) {
        if (!window.confirm("Delete this payment method?")) return;

        try {
            await request(`/api/deposit-settings/${id}`, {
                method: "DELETE"
            });
            setSuccess("Payment method deleted");
            await loadSettings();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 p-5 text-white md:p-10">
            <div className="mx-auto max-w-5xl space-y-6">
                <Link href="/admin" className="inline-flex items-center gap-2 text-blue-400">
                    <ArrowLeft size={18} /> Dashboard
                </Link>

                <h1 className="text-3xl font-bold">Deposit Settings</h1>

                {error && <p className="text-red-400">{error}</p>}
                {success && <p className="text-green-400">{success}</p>}

                <form
                    onSubmit={saveSetting}
                    className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-5"
                >
                    <h2 className="text-xl font-semibold">
                        {editingId ? "Edit Payment Method" : "Add Payment Method"}
                    </h2>

                    <label className="block space-y-2">
                        <span>Payment Method</span>
                        <select
                            value={form.method}
                            onChange={(e) => setForm({ ...form, method: e.target.value })}
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                        >
                            <option value="Crypto">Crypto</option>
                            <option value="JazzCash">JazzCash</option>
                            <option value="Easypaisa">Easypaisa</option>
                        </select>
                    </label>

                    <label className="block space-y-2">
                        <span>Channel</span>
                        <input
                            required
                            value={form.channel}
                            onChange={(e) => setForm({ ...form, channel: e.target.value })}
                            placeholder="e.g. USDT-TRC-20 or JazzCash"
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                        />
                    </label>

                    <label className="block space-y-2">
                        <span>Account / Wallet Details</span>
                        <input
                            required
                            value={form.accountDetails}
                            onChange={(e) => setForm({ ...form, accountDetails: e.target.value })}
                            placeholder="Receiving account or wallet address"
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                        />
                    </label>

                    <label className="block space-y-2">
                        <span>Account Title (Optional)</span>
                        <input
                            value={form.accountTitle}
                            onChange={(e) => setForm({ ...form, accountTitle: e.target.value })}
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                        />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block space-y-2">
                            <span>Minimum Deposit</span>
                            <input
                                required
                                type="number"
                                min="1"
                                value={form.minAmount}
                                onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
                                className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span>Maximum Deposit</span>
                            <input
                                required
                                type="number"
                                min="1"
                                value={form.maxAmount}
                                onChange={(e) => setForm({ ...form, maxAmount: e.target.value })}
                                className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                            />
                        </label>
                    </div>

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        />
                        Active
                    </label>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold disabled:opacity-50"
                        >
                            <Plus size={18} className="mr-1 inline" />
                            {saving ? "Saving..." : editingId ? "Update Method" : "Add Method"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-lg bg-slate-700 px-5 py-3"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                    <h2 className="mb-4 text-xl font-semibold">
                        Payment Methods ({settings.length})
                    </h2>

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="space-y-3">
                            {settings.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex items-center gap-3 rounded-lg border border-slate-700 p-3"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold">{item.method} — {item.channel}</p>
                                        <p className="break-all text-sm text-slate-300">{item.accountDetails}</p>
                                        <p className="text-xs text-slate-400">
                                            Rs {item.minAmount}–{item.maxAmount} ·{" "}
                                            {item.isActive ? "Active" : "Inactive"}
                                        </p>
                                    </div>

                                    <button onClick={() => editSetting(item)} className="text-blue-400">
                                        <Pencil size={19} />
                                    </button>

                                    <button onClick={() => deleteSetting(item._id)} className="text-red-400">
                                        <Trash2 size={19} />
                                    </button>
                                </div>
                            ))}

                            {!settings.length && <p>No payment methods added yet.</p>}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
