
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Plus, Pencil, Trash2,
    Upload, ExternalLink
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const emptyForm = {
    name: "",
    gameUrl: "",
    type: "game",
    image: { url: "", publicId: "" },
    isActive: true
};
export default function GamesManagement() {
    const router = useRouter();

    const [games, setGames] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getToken = () => sessionStorage.getItem("adminToken");

    async function request(path, options = {}) {
        const res = await fetch(`${API}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${getToken()}`,
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

        if (!res.ok) {
            throw new Error(data.message || "Request failed");
        }

        return data;
    }

    async function loadData() {
        const [gameData, categoryData] = await Promise.all([
            request("/api/games/admin"),
            request("/api/categories")
        ]);

        setGames(
            (gameData.games || []).filter(
                (game) => game.type === "game"
            )
        );
        setCategories(categoryData.categories || []);
    }

    useEffect(() => {
        if (!getToken()) {
            router.replace("/admin/login");
            return;
        }

        loadData()
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    async function uploadImage(file) {
        if (!file) return;

        setUploading(true);
        setError("");
        setSuccess("");

        try {
            const body = new FormData();
            body.append("image", file);

            const res = await fetch(`${API}/api/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${getToken()}`
                },
                body
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    sessionStorage.removeItem("adminToken");
                    router.replace("/admin/login");
                    return;
                }
                throw new Error(data.message || "Image upload failed");
            }

            setForm((prev) => ({
                ...prev,
                image: data.image
            }));

            setSuccess("Image uploaded successfully");
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    }

    function resetForm() {
        setForm({ ...emptyForm });
        setEditingId(null);
    }

    async function saveGame(e) {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!form.image.url) {
            setError("Please upload a game image");
            return;
        }

        setSaving(true);

        try {
            await request(
                editingId ? `/api/games/${editingId}` : "/api/games",
                {
                    method: editingId ? "PUT" : "POST",
                    body: JSON.stringify({
                        name: form.name,
                        gameUrl: form.gameUrl,
                        image: form.image,
                        type: "game",
                        isActive: form.isActive
                    })
                }
            );

            setSuccess(editingId ? "Game updated" : "Game added");
            resetForm();
            await loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    function editGame(game) {
        setEditingId(game._id);

        setForm({
            name: game.name,
            gameUrl: game.gameUrl || "",
            type: "game",
            image: game.image || emptyForm.image,
            isActive: game.isActive
        });

        setError("");
        setSuccess("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function deleteGame(id) {
        if (!window.confirm("Delete this game permanently?")) return;

        setError("");
        setSuccess("");

        try {
            await request(`/api/games/${id}`, {
                method: "DELETE"
            });

            setSuccess("Game deleted");
            await loadData();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 p-5 text-white md:p-10">
            <div className="mx-auto max-w-6xl space-y-7">

                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-blue-400"
                >
                    <ArrowLeft size={18} />
                    Dashboard
                </Link>

                <h1 className="text-3xl font-bold">
                    Manage Games
                </h1>

                {error && (
                    <div role="alert" className="rounded-lg bg-red-950 p-4 text-red-300">
                        {error}
                    </div>
                )}

                {success && (
                    <div role="status" className="rounded-lg bg-green-950 p-4 text-green-300">
                        {success}
                    </div>
                )}

                <form
                    onSubmit={saveGame}
                    className="space-y-5 rounded-xl border border-slate-700 bg-slate-900 p-5"
                >
                    <h2 className="text-xl font-semibold">
                        {editingId ? "Edit Game" : "Add New Game"}
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2">

                        <label className="space-y-2">
                            <span className="text-sm text-slate-300">Game Name</span>
                            <input
                                required
                                maxLength={120}
                                value={form.name}
                                placeholder="Enter game name"
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 outline-none focus:border-blue-500"
                            />
                        </label>


                        <label className="space-y-2">
                            <span className="text-sm text-slate-300">Game URL</span>
                            <input
                                required
                                type="url"
                                pattern="https://.*"
                                value={form.gameUrl}
                                placeholder="https://example.com/game"
                                onChange={(e) =>
                                    setForm({ ...form, gameUrl: e.target.value })
                                }
                                className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                            />
                        </label>

                    </div>

                    <div className="space-y-3">
                        <p className="text-sm text-slate-300">
                            Game Image
                        </p>

                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-800 px-5 py-3 text-blue-400">
                            <Upload size={19} />
                            {uploading ? "Uploading..." : "Upload Image"}
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                disabled={uploading}
                                className="hidden"
                                onChange={(e) => {
                                    uploadImage(e.target.files?.[0]);
                                    e.target.value = "";
                                }}
                            />
                        </label>

                        {form.image?.url && (
                            <img
                                src={form.image.url}
                                alt="Game preview"
                                className="h-32 w-32 rounded-lg object-cover"
                            />
                        )}
                    </div>



                    <div className="grid gap-4 sm:grid-cols-2">

                        <label className="flex items-center gap-3">
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
                            Active Game
                        </label>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={saving || uploading}
                            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold disabled:opacity-50"
                        >
                            <Plus size={18} className="mr-1 inline" />
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Update Game"
                                    : "Add Game"}
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
                        All Games ({games.length})
                    </h2>

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="space-y-3">
                            {games.map((game) => (
                                <div
                                    key={game._id}
                                    className="flex items-center gap-4 rounded-lg border border-slate-700 p-3"
                                >
                                    {game.image?.url ? (
                                        <img
                                            src={game.image.url}
                                            alt={game.name}
                                            className="h-16 w-16 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded-lg bg-slate-800" />
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold">
                                            {game.name}
                                        </h3>


                                        <p className="text-xs text-slate-400">
                                            {game.isActive ? "Active" : "Inactive"}
                                        </p>
                                    </div>

                                    <a
                                        href={game.gameUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-300"
                                        aria-label="Open game"
                                    >
                                        <ExternalLink size={19} />
                                    </a>

                                    <button
                                        onClick={() => editGame(game)}
                                        className="text-blue-400"
                                        aria-label="Edit game"
                                    >
                                        <Pencil size={19} />
                                    </button>

                                    <button
                                        onClick={() => deleteGame(game._id)}
                                        className="text-red-400"
                                        aria-label="Delete game"
                                    >
                                        <Trash2 size={19} />
                                    </button>
                                </div>
                            ))}

                            {!games.length && (
                                <p className="text-slate-400">No games added yet.</p>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
