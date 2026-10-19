
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const emptyForm = {
    message: "",
    sortOrder: 0,
    isActive: true
};

export default function AnnouncementsPage() {
    const router = useRouter();

    const [announcements, setAnnouncements] = useState([]);
    const [form, setForm] = useState({ ...emptyForm });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function getToken() {
        return sessionStorage.getItem("adminToken");
    }

    async function request(path, options = {}) {
        const res = await fetch(`${API}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${getToken()}`,
                ...(options.body
                    ? { "Content-Type": "application/json" }
                    : {})
            }
        });

        const data = await res.json();

        if (res.status === 401 || res.status === 403) {
            sessionStorage.removeItem("adminToken");
            router.replace("/admin/login");
            throw new Error("Session expired");
        }

        if (!res.ok) {
            throw new Error(data.message || "Request failed");
        }

        return data;
    }

    async function loadAnnouncements() {
        const data = await request("/api/announcements/admin");
        setAnnouncements(data.announcements || []);
    }

    useEffect(() => {
        if (!getToken()) {
            router.replace("/admin/login");
            return;
        }

        loadAnnouncements()
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    function resetForm() {
        setForm({ ...emptyForm });
        setEditingId(null);
    }

    function editAnnouncement(item) {
        setEditingId(item._id);

        setForm({
            message: item.message,
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive
        });

        setError("");
        setSuccess("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function saveAnnouncement(e) {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await request(
                editingId
                    ? `/api/announcements/${editingId}`
                    : "/api/announcements",
                {
                    method: editingId ? "PUT" : "POST",
                    body: JSON.stringify({
                        message: form.message,
                        sortOrder: Number(form.sortOrder),
                        isActive: form.isActive
                    })
                }
            );

            setSuccess(
                editingId
                    ? "Announcement updated successfully"
                    : "Announcement added successfully"
            );

            resetForm();
            await loadAnnouncements();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function deleteAnnouncement(id) {
        if (!window.confirm("Delete this announcement?")) return;

        setError("");
        setSuccess("");

        try {
            await request(`/api/announcements/${id}`, {
                method: "DELETE"
            });

            setSuccess("Announcement deleted successfully");
            await loadAnnouncements();
        } catch (err) {
            setError(err.message);
        }
    }

    async function toggleActive(item) {
        setError("");
        setSuccess("");

        try {
            await request(`/api/announcements/${item._id}`, {
                method: "PUT",
                body: JSON.stringify({
                    isActive: !item.isActive
                })
            });

            await loadAnnouncements();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 p-5 text-white md:p-10">
            <div className="mx-auto max-w-5xl space-y-6">
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-blue-400"
                >
                    <ArrowLeft size={18} />
                    Dashboard
                </Link>

                <h1 className="text-3xl font-bold">
                    Manage Announcements
                </h1>

                {error && (
                    <p role="alert" className="rounded-lg bg-red-950 p-3 text-red-300">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="rounded-lg bg-green-950 p-3 text-green-300">
                        {success}
                    </p>
                )}

                <form
                    onSubmit={saveAnnouncement}
                    className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-5"
                >
                    <h2 className="text-xl font-semibold">
                        {editingId ? "Edit Announcement" : "Add Announcement"}
                    </h2>

                    <label className="block space-y-2">
                        <span className="text-sm text-slate-300">
                            Scrolling Message
                        </span>

                        <textarea
                            required
                            maxLength={250}
                            rows={3}
                            value={form.message}
                            onChange={(e) =>
                                setForm({ ...form, message: e.target.value })
                            }
                            placeholder="Example: 39J successfully withdrew Rs12,100.00 !!"
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 outline-none focus:border-blue-500"
                        />
                    </label>

                    <label className="block space-y-2">
                        <span className="text-sm text-slate-300">
                            Display Order
                        </span>

                        <input
                            type="number"
                            value={form.sortOrder}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    sortOrder: Number(e.target.value)
                                })
                            }
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                        />
                    </label>

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    isActive: e.target.checked
                                })
                            }
                        />
                        Active Announcement
                    </label>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold disabled:opacity-50"
                        >
                            <Plus size={17} className="mr-1 inline" />
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Update Announcement"
                                    : "Add Announcement"}
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
                    <h2 className="mb-5 text-xl font-semibold">
                        All Announcements ({announcements.length})
                    </h2>

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="space-y-3">
                            {announcements.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex items-center gap-3 rounded-lg border border-slate-700 p-3"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="break-words font-medium">
                                            {item.message}
                                        </p>

                                        <p className="mt-2 text-xs text-slate-400">
                                            Order: {item.sortOrder} ·{" "}
                                            {item.isActive ? "Active" : "Inactive"}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => toggleActive(item)}
                                        className={
                                            item.isActive
                                                ? "rounded bg-green-900 px-3 py-2 text-xs text-green-300"
                                                : "rounded bg-slate-700 px-3 py-2 text-xs"
                                        }
                                    >
                                        {item.isActive ? "Active" : "Inactive"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => editAnnouncement(item)}
                                        className="text-blue-400"
                                        aria-label="Edit announcement"
                                    >
                                        <Pencil size={19} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => deleteAnnouncement(item._id)}
                                        className="text-red-400"
                                        aria-label="Delete announcement"
                                    >
                                        <Trash2 size={19} />
                                    </button>
                                </div>
                            ))}

                            {!announcements.length && (
                                <p className="text-slate-400">
                                    No announcements added yet.
                                </p>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
