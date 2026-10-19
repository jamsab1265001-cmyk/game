
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, Upload } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const emptyForm = {
    name: "",
    type: "parent",
    icon: { url: "", publicId: "" },
    banner: { url: "", publicId: "" },
    parentCategories: [],
    sortOrder: 0,
    displayStyle: "full-row",
    isActive: true
};

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const token = () => sessionStorage.getItem("adminToken");

    async function apiRequest(path, options = {}) {
        const res = await fetch(`${API}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token()}`,
                ...(options.body ? { "Content-Type": "application/json" } : {}),
                ...options.headers
            }
        });

        const data = await res.json();

        if (res.status === 401 || res.status === 403) {
            sessionStorage.removeItem("adminToken");
            router.replace("/admin/login");
            throw new Error("Session expired");
        }

        if (!res.ok) throw new Error(data.message || "Request failed");
        return data;
    }

    async function loadCategories() {
        const data = await apiRequest("/api/categories");
        setCategories(data.categories);
    }

    useEffect(() => {
        if (!token()) {
            router.replace("/admin/login");
            return;
        }

        loadCategories()
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

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

            setForm((prev) => ({ ...prev, icon: data.image }));
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    }

    async function saveCategory(e) {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            await apiRequest(
                editingId ? `/api/categories/${editingId}` : "/api/categories",
                {
                    method: editingId ? "PUT" : "POST",
                    body: JSON.stringify({
                        ...form,
                        type: form.type,
                        parentCategories: form.parentCategories || []
                    })
                }
            );

            setForm(emptyForm);
            setEditingId(null);
            await loadCategories();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function deleteCategory(id) {
        if (!window.confirm("Delete this category?")) return;

        try {
            await apiRequest(`/api/categories/${id}`, { method: "DELETE" });
            await loadCategories();
        } catch (err) {
            setError(err.message);
        }
    }

    function editCategory(category) {
        setEditingId(category._id);
        setForm({
            name: category.name,
            icon: category.icon || emptyForm.icon,
            type: category.type || "parent",
            banner: category.banner || emptyForm.banner,
            parentCategories: (category.parentCategories || []).map(
                (parent) => typeof parent === "string" ? parent : parent._id
            ),
            sortOrder: category.sortOrder || 0,
            displayStyle: category.displayStyle || "full-row",
            isActive: category.isActive
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <main className="min-h-screen bg-slate-950 text-white p-5 md:p-10">
            <div className="max-w-5xl mx-auto space-y-7">
                <Link href="/admin" className="inline-flex items-center gap-2 text-blue-400">
                    <ArrowLeft size={18} /> Dashboard
                </Link>

                <h1 className="text-3xl font-bold">Manage Categories</h1>

                {error && (
                    <p role="alert" className="rounded-lg bg-red-950 p-3 text-red-300">
                        {error}
                    </p>
                )}

                <form onSubmit={saveCategory} className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-4">
                    <h2 className="text-xl font-semibold">
                        {editingId ? "Edit Category" : "Add Category"}
                    </h2>


                    <label className="block space-y-2">
                        <span className="text-sm text-slate-300">Category Type</span>
                        <select
                            value={form.type}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    type: e.target.value
                                })
                            }
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white"
                        >
                            <option value="parent">Parent Category (Left Sidebar)</option>
                            <option value="subcategory">Subcategory</option>
                        </select>
                    </label>


                    <input
                        required
                        maxLength={60}
                        placeholder="Category Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-lg bg-slate-800 border border-slate-600 p-3"
                    />



                    {form.type === "subcategory" && (
                        <label className="block space-y-2">
                            <span className="text-sm text-slate-300">
                                Subcategory Display Style
                            </span>

                            <select
                                value={form.displayStyle}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        displayStyle: e.target.value
                                    })
                                }
                                className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white"
                            >
                                <option value="full-row">
                                    Full Row Banner
                                </option>
                                <option value="single-item">
                                    Single Grid Item
                                </option>
                            </select>

                            <p className="text-xs text-slate-400">
                                Full Row occupies the entire games row.
                                Single Item occupies one grid cell.
                                Both open the subcategory page.
                            </p>
                        </label>
                    )}

                    {form.type === "subcategory" && (
                        <div className="space-y-3">

                            <label className="block text-sm text-slate-300">
                                Subcategory Banner
                            </label>

                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                disabled={uploading}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setUploading(true);
                                    setError("");

                                    try {
                                        const body = new FormData();
                                        body.append("image", file);

                                        const res = await fetch(`${API}/api/upload`, {
                                            method: "POST",
                                            headers: {
                                                Authorization: `Bearer ${token()}`
                                            },
                                            body
                                        });

                                        const data = await res.json();

                                        if (!res.ok) {
                                            throw new Error(data.message || "Upload failed");
                                        }

                                        setForm((prev) => ({
                                            ...prev,
                                            banner: data.image
                                        }));
                                    } catch (err) {
                                        setError(err.message);
                                    } finally {
                                        setUploading(false);
                                    }
                                }}
                                className="w-full rounded-lg bg-slate-800 p-3"
                            />

                            {form.banner?.url && (
                                <img
                                    src={form.banner.url}
                                    alt="Subcategory banner"
                                    className="w-full max-w-sm rounded-lg"
                                />
                            )}
                        </div>
                    )}



                    {form.type === "parent" && (
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer text-blue-400">
                                <Upload size={20} />
                                {uploading ? "Uploading..." : "Upload Category Icon"}
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    disabled={uploading}
                                    onChange={(e) => uploadImage(e.target.files?.[0])}
                                />
                            </label>

                            {form.icon?.url && (
                                <img
                                    src={form.icon.url}
                                    alt="Category icon"
                                    className="h-20 w-20 object-contain"
                                />
                            )}
                        </div>
                    )}
                    {form.icon?.url && (
                        <img src={form.icon.url} alt="Category icon" className="h-20 w-20 object-contain" />
                    )}

                    <input
                        type="number"
                        placeholder="Display Order"
                        value={form.sortOrder}
                        onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                        className="w-full rounded-lg bg-slate-800 border border-slate-600 p-3"
                    />

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
                            disabled={saving || uploading}
                            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold disabled:opacity-50"
                        >
                            <Plus size={17} className="inline mr-1" />
                            {saving ? "Saving..." : editingId ? "Update Category" : "Add Category"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={() => { setEditingId(null); setForm(emptyForm); }}
                                className="rounded-lg bg-slate-700 px-5 py-3"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                    <h2 className="text-xl font-semibold mb-5">All Categories</h2>

                    {loading ? <p>Loading...</p> : (
                        <div className="space-y-3">
                            {categories.map((category) => (
                                <div key={category._id} className="flex items-center gap-4 border border-slate-700 rounded-lg p-3">
                                    {category.icon?.url ? (
                                        <img src={category.icon.url} alt="" className="w-12 h-12 object-contain" />
                                    ) : (
                                        <div className="w-12 h-12 bg-slate-800 rounded-lg" />
                                    )}

                                    <div className="flex-1">
                                        <p className="font-semibold">{category.name}</p>
                                        <p className="text-xs text-slate-400">
                                            Order: {category.sortOrder} · {category.isActive ? "Active" : "Inactive"}
                                        </p>
                                    </div>

                                    <button onClick={() => editCategory(category)} className="text-blue-400" aria-label="Edit category">
                                        <Pencil size={19} />
                                    </button>

                                    <button onClick={() => deleteCategory(category._id)} className="text-red-400" aria-label="Delete category">
                                        <Trash2 size={19} />
                                    </button>
                                </div>
                            ))}

                            {!categories.length && <p className="text-slate-400">No categories yet.</p>}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
