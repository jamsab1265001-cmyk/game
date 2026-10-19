
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, GripVertical, Save, Trash2 } from "lucide-react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    arrayMove,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const itemKey = (item) => `${item.itemType}:${item.itemId}`;

function SortableItem({ item, onRemove }) {
    const key = itemKey(item);
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: key });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition
            }}
            className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 p-3"
        >
            <button
                type="button"
                {...attributes}
                {...listeners}
                className="cursor-grab touch-none text-slate-400"
                aria-label="Drag to reorder"
            >
                <GripVertical size={22} />
            </button>

            {item.image && (
                <img
                    src={item.image}
                    alt=""
                    className="h-12 w-12 rounded object-cover"
                />
            )}

            <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.name}</p>
                <p className="text-xs text-slate-400">
                    {item.displayStyle === "full-row"
                        ? "Full Row Banner"
                        : "Single Grid Item"}
                </p>
            </div>

            <button
                type="button"
                onClick={() => onRemove(key)}
                className="text-red-400"
                aria-label="Remove item"
            >
                <Trash2 size={19} />
            </button>
        </div>
    );
}

export default function OrganizerPage() {
    const [categories, setCategories] = useState([]);
    const [games, setGames] = useState([]);
    const [search, setSearch] = useState("");
    const [parentId, setParentId] = useState("");
    const [items, setItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 }
        })
    );

    const token = () => sessionStorage.getItem("adminToken");

    async function request(path, options = {}) {
        const response = await fetch(`${API}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token()}`,
                ...(options.body ? { "Content-Type": "application/json" } : {})
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Request failed");
        }

        return data;
    }

    useEffect(() => {
        if (!token()) {
            window.location.href = "/admin/login";
            return;
        }

        Promise.all([
            request("/api/categories"),
            request("/api/games/admin")
        ])
            .then(([categoryData, gameData]) => {
                setCategories(categoryData.categories || []);
                setGames(gameData.games || []);

                const firstParent = categoryData.categories?.find(
                    (category) => category.type === "parent"
                );

                if (firstParent) setParentId(firstParent._id);
            })
            .catch((err) => setError(err.message));
    }, []);

    useEffect(() => {
        if (!parentId) return;

        request(`/api/layouts/${parentId}`)
            .then((data) => {
                setItems(
                    (data.items || []).map((entry) => ({
                        itemType: entry.itemType,
                        itemId: entry.item._id,
                        name: entry.item.name,
                        displayStyle: entry.item.displayStyle || (
                            entry.itemType === "subcategory" ? "full-row" : "single-item"
                        ),
                        image:
                            entry.itemType === "game"
                                ? entry.item.image?.url
                                : entry.item.banner?.url
                    }))
                );
            })
            .catch((err) => setError(err.message));
    }, [parentId]);

    function addItem(itemType, item) {
        const id = `${itemType}:${item._id}`;

        if (items.some((existing) => itemKey(existing) === id)) return;

        setItems((prev) => [
            ...prev,
            {
                itemType,
                itemId: item._id,
                name: item.name,
                displayStyle: item.displayStyle || (
                    itemType === "subcategory" ? "full-row" : "single-item"
                ),
                image:
                    itemType === "game"
                        ? item.image?.url
                        : item.banner?.url
            }
        ]);
    }

    function removeItem(key) {
        setItems((prev) =>
            prev.filter((item) => itemKey(item) !== key)
        );
    }

    function onDragEnd(event) {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        setItems((prev) => {
            const oldIndex = prev.findIndex(
                (item) => itemKey(item) === active.id
            );

            const newIndex = prev.findIndex(
                (item) => itemKey(item) === over.id
            );

            if (oldIndex < 0 || newIndex < 0) return prev;

            return arrayMove(prev, oldIndex, newIndex);
        });
    }

    async function saveLayout() {
        setSaving(true);
        setError("");
        setMessage("");

        try {
            await request(`/api/layouts/${parentId}`, {
                method: "PUT",
                body: JSON.stringify({
                    items: items.map(({ itemType, itemId }) => ({
                        itemType,
                        itemId
                    }))
                })
            });

            setMessage("Layout saved successfully");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    const parents = categories.filter(
        (category) => category.type === "parent"
    );

    const subcategories = categories.filter(
        (category) => category.type === "subcategory"
    );

    const availableGames = games.filter(
        (game) => game.type === "game"
    );

    return (
        <main className="min-h-screen bg-slate-950 p-5 text-white md:p-10">
            <div className="mx-auto max-w-6xl space-y-6">
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-blue-400"
                >
                    <ArrowLeft size={18} /> Dashboard
                </Link>

                <h1 className="text-3xl font-bold">
                    Drag & Drop Organizer
                </h1>

                <Link
                    href="/admin/organizer/subcategories"
                    className="inline-block rounded-lg bg-purple-600 px-5 py-3 font-semibold"
                >
                    Manage Subcategory Games
                </Link>

                {error && (
                    <p role="alert" className="rounded-lg bg-red-950 p-3 text-red-300">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="rounded-lg bg-green-950 p-3 text-green-300">
                        {message}
                    </p>
                )}

                <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                >
                    {parents.map((category) => (
                        <option key={category._id} value={category._id}>
                            {category.name}
                        </option>
                    ))}
                </select>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <h2 className="text-xl font-semibold">
                            Available Items
                        </h2>

                        <input
                            type="search"
                            placeholder="Search games or subcategories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white outline-none focus:border-blue-500"
                        />

                        <h3 className="font-semibold text-blue-400">
                            Games
                        </h3>

                        <div className="max-h-72 space-y-2 overflow-auto">
                            {availableGames
                                .filter((game) =>
                                    game.name.toLowerCase().includes(search.trim().toLowerCase())
                                )
                                .map((game) => (
                                    <button
                                        key={game._id}
                                        onClick={() => addItem("game", game)}
                                        className="flex w-full items-center gap-3 rounded-lg bg-slate-800 p-3 text-left hover:bg-slate-700"
                                    >
                                        {game.image?.url && (
                                            <img
                                                src={game.image.url}
                                                alt=""
                                                className="h-10 w-10 rounded object-cover"
                                            />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate">{game.name}</p>
                                            <p className="text-xs text-slate-400">
                                                {game.displayStyle === "full-row"
                                                    ? "Full Row Banner"
                                                    : "Single Grid Item"}
                                            </p>
                                        </div>
                                        <span className="text-blue-400">+ Add</span>
                                    </button>
                                ))}
                        </div>

                        <h3 className="font-semibold text-yellow-400">
                            Subcategories
                        </h3>

                        <div className="max-h-72 space-y-2 overflow-auto">
                            {subcategories
                                .filter((category) =>
                                    category.name.toLowerCase().includes(search.trim().toLowerCase())
                                )
                                .map((category) => (
                                    <button
                                        key={category._id}
                                        onClick={() => addItem("subcategory", category)}
                                        className="flex w-full items-center gap-3 rounded-lg bg-slate-800 p-3 text-left hover:bg-slate-700"
                                    >
                                        {category.banner?.url && (
                                            <img
                                                src={category.banner.url}
                                                alt=""
                                                className="h-10 w-16 rounded object-cover"
                                            />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate">{category.name}</p>
                                            <p className="text-xs text-slate-400">
                                                {category.displayStyle === "single-item"
                                                    ? "Single Grid Item"
                                                    : "Full Row Banner"}
                                            </p>
                                        </div>
                                        <span className="text-blue-400">+ Add</span>
                                    </button>
                                ))}
                        </div>
                    </section>

                    <section className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <h2 className="text-xl font-semibold">
                            Homepage Display Order
                        </h2>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={onDragEnd}
                        >
                            <SortableContext
                                items={items.map(itemKey)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <SortableItem
                                            key={itemKey(item)}
                                            item={item}
                                            onRemove={removeItem}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        <button
                            disabled={saving || !parentId}
                            onClick={saveLayout}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 p-3 font-semibold disabled:opacity-50"
                        >
                            <Save size={19} />
                            {saving ? "Saving..." : "Save Layout"}
                        </button>
                    </section>
                </div>
            </div>
        </main>
    );
}
