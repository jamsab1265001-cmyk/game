
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, Upload } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const emptyForm = {
    title: "",
    type: "image",
    image: { url: "", publicId: "" },
    text: "",
    targetType: "internal",
    target: "deposit",
    intensity: 5,
    intervalSeconds: 60,
    isActive: true
};

const pages = [
    ["home", "Home"],
    ["deposit", "Deposit"],
    ["withdraw", "Withdraw"],
    ["vip", "VIP"],
    ["promo", "Promotions"],
    ["earn", "Earn"],
    ["mine", "Mine"],
    ["service", "Service Center"],
    ["roulette", "Lucky Wheel"],
    ["ranking", "Ranking"],
    ["withdraw-history", "Withdrawal History"]
];

export default function PopupsPage() {
    const router = useRouter();
    const [popups, setPopups] = useState([]);
    const [form, setForm] = useState({ ...emptyForm });
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = () => sessionStorage.getItem("adminToken");

    async function request(path, options = {}) {
        const res = await fetch(`${API}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token()}`,
                ...(options.body ? { "Content-Type": "application/json" } : {})
            }
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Request failed");
        return data;
    }

    async function loadPopups() {
        const data = await request("/api/popups/admin");
        setPopups(data.popups || []);
    }

    useEffect(() => {
        if (!token()) {
            router.replace("/admin/login");
            return;
        }

        loadPopups().catch((err) => setError(err.message));
    }, []);

    function resetForm() {
        setForm({ ...emptyForm, image: { ...emptyForm.image } });
        setEditingId(null);
    }

    function editPopup(item) {
        setEditingId(item._id);
        setForm({
            title: item.title,
            type: item.type,
            image: item.image || { url: "", publicId: "" },
            text: item.text || "",
            targetType: item.targetType,
            target: item.target,
            intensity: item.intensity,
            intervalSeconds: item.intervalSeconds,
            isActive: item.isActive
        });
        setError("");
        setSuccess("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function uploadImage(file) {
        if (!file) return;
        setUploading(true);
        setError("");

        try {
            const body = new FormData();
            body.append("image", file);

            const res = await fetch(`${API}/api/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token()}` },
                body
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Upload failed");

            setForm((prev) => ({ ...prev, image: data.image }));
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    }

    async function savePopup(e) {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await request(
                editingId ? `/api/popups/${editingId}` : "/api/popups",
                {
                    method: editingId ? "PUT" : "POST",
                    body: JSON.stringify({
                        ...form,
                        intensity: Number(form.intensity),
                        intervalSeconds: Number(form.intervalSeconds)
                    })
                }
            );

            setSuccess(editingId ? "Popup updated" : "Popup added");
            resetForm();
            await loadPopups();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function deletePopup(id) {
        if (!window.confirm("Delete this popup?")) return;

        try {
            await request(`/api/popups/${id}`, { method: "DELETE" });
            await loadPopups();
            setSuccess("Popup deleted");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 p-5 text-white md:p-10">
            <div className="mx-auto max-w-5xl space-y-6">
                <Link href="/admin" className="flex items-center gap-2 text-blue-400">
                    <ArrowLeft size={18} /> Dashboard
                </Link>

                <h1 className="text-3xl font-bold">Popup Management</h1>

                {error && <p className="text-red-400">{error}</p>}
                {success && <p className="text-green-400">{success}</p>}

                <form onSubmit={savePopup} className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-5">
                    <h2 className="text-xl font-semibold">
                        {editingId ? "Edit Popup" : "Add Popup"}
                    </h2>

                    <input
                        required
                        maxLength={100}
                        placeholder="Popup title (Admin reference)"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                    />

                    <label className="block space-y-2">
                        <span>Popup Type</span>
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                        >
                            <option value="image">Image Popup</option>
                            <option value="text">Text Popup</option>
                        </select>
                    </label>

                    {form.type === "image" ? (
                        <div className="space-y-3">
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-blue-400">
                                <Upload size={18} />
                                {uploading ? "Uploading..." : "Upload Popup Image"}
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    disabled={uploading}
                                    onChange={(e) => uploadImage(e.target.files?.[0])}
                                />
                            </label>

                            {form.image?.url && (
                                <img src={form.image.url} alt="Popup preview" className="max-h-64 rounded-lg object-contain" />
                            )}
                        </div>
                    ) : (
                        <textarea
                            required
                            rows={5}
                            maxLength={1000}
                            placeholder="Popup message"
                            value={form.text}
                            onChange={(e) => setForm({ ...form, text: e.target.value })}
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                        />
                    )}

                    <label className="block space-y-2">
                        <span>Target Type</span>
                        <select
                            value={form.targetType}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    targetType: e.target.value,
                                    target: e.target.value === "internal" ? "deposit" : ""
                                })
                            }
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                        >
                            <option value="internal">In-App Page</option>
                            <option value="external">External Link</option>
                        </select>
                    </label>

                    {form.targetType === "internal" ? (
                        <select
                            value={form.target}
                            onChange={(e) => setForm({ ...form, target: e.target.value })}
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                        >
                            {pages.map(([id, name]) => (
                                <option key={id} value={id}>{name}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            required
                            type="url"
                            placeholder="https://example.com"
                            value={form.target}
                            onChange={(e) => setForm({ ...form, target: e.target.value })}
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                        />
                    )}

                    <label className="block space-y-2">
                        <span>Intensity: {form.intensity}/10</span>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={form.intensity}
                            onChange={(e) => setForm({ ...form, intensity: Number(e.target.value) })}
                            className="w-full"
                        />
                    </label>

                    <label className="block space-y-2">
                        <span>Show Interval (seconds)</span>
                        <input
                            type="number"
                            min="10"
                            max="3600"
                            value={form.intervalSeconds}
                            onChange={(e) => setForm({ ...form, intervalSeconds: Number(e.target.value) })}
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                        />
                    </label>

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
                            disabled={saving || uploading}
                            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold disabled:opacity-50"
                        >
                            <Plus size={18} className="mr-1 inline" />
                            {saving ? "Saving..." : editingId ? "Update Popup" : "Add Popup"}
                        </button>

                        {editingId && (
                            <button type="button" onClick={resetForm} className="rounded-lg bg-slate-700 px-5 py-3">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <section className="space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-5">
                    <h2 className="text-xl font-semibold">All Popups ({popups.length})</h2>

                    {popups.map((item) => (
                        <div key={item._id} className="flex items-center gap-3 rounded-lg border border-slate-700 p-3">
                            {item.image?.url && item.type === "image" && (
                                <img src={item.image.url} alt="" className="h-14 w-14 rounded object-cover" />
                            )}

                            <div className="min-w-0 flex-1">
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-xs text-slate-400">
                                    {item.type} · Intensity {item.intensity}/10 · Every {item.intervalSeconds}s · {item.isActive ? "Active" : "Inactive"}
                                </p>
                            </div>

                            <button type="button" onClick={() => editPopup(item)} className="text-blue-400">
                                <Pencil size={19} />
                            </button>

                            <button type="button" onClick={() => deletePopup(item._id)} className="text-red-400">
                                <Trash2 size={19} />
                            </button>
                        </div>
                    ))}

                    {!popups.length && <p className="text-slate-400">No popups added yet.</p>}
                </section>
            </div>
        </main>
    );
}
