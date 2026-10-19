
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

function SortableGame({ game, remove }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: game._id });

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
                {...attributes}
                {...listeners}
                className="cursor-grab touch-none text-slate-400"
            >
                <GripVertical size={22} />
            </button>

            {game.image?.url && (
                <img src={game.image.url} alt="" className="h-12 w-12 rounded object-cover" />
            )}

            <span className="flex-1">{game.name}</span>

            <button onClick={() => remove(game._id)} className="text-red-400">
                <Trash2 size={19} />
            </button>
        </div>
    );
}

export default function SubcategoryOrganizer() {
    const [categories, setCategories] = useState([]);
    const [allGames, setAllGames] = useState([]);
    const [subcategoryId, setSubcategoryId] = useState("");
    const [selectedGames, setSelectedGames] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 }
        })
    );

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

    useEffect(() => {
        Promise.all([
            request("/api/categories"),
            request("/api/games/admin")
        ]).then(([categoryData, gameData]) => {
            const subs = (categoryData.categories || []).filter(
                (category) => category.type === "subcategory"
            );

            setCategories(subs);
            setAllGames((gameData.games || []).filter((game) => game.type === "game"));

            if (subs.length) setSubcategoryId(subs[0]._id);
        }).catch((err) => setError(err.message));
    }, []);

    useEffect(() => {
        if (!subcategoryId) return;

        request(`/api/subcategory-layouts/${subcategoryId}`)
            .then((data) => setSelectedGames(data.games || []))
            .catch((err) => setError(err.message));
    }, [subcategoryId]);

    function addGame(game) {
        setSelectedGames((prev) =>
            prev.some((item) => item._id === game._id)
                ? prev
                : [...prev, game]
        );
    }

    function removeGame(id) {
        setSelectedGames((prev) => prev.filter((game) => game._id !== id));
    }

    function onDragEnd({ active, over }) {
        if (!over || active.id === over.id) return;

        setSelectedGames((prev) => {
            const oldIndex = prev.findIndex((game) => game._id === active.id);
            const newIndex = prev.findIndex((game) => game._id === over.id);
            return arrayMove(prev, oldIndex, newIndex);
        });
    }

    async function save() {
        setError("");
        setMessage("");

        try {
            await request(`/api/subcategory-layouts/${subcategoryId}`, {
                method: "PUT",
                body: JSON.stringify({
                    games: selectedGames.map((game) => game._id)
                })
            });

            setMessage("Games saved successfully");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 p-5 text-white md:p-10">
            <div className="mx-auto max-w-6xl space-y-6">
                <Link href="/admin/organizer" className="flex items-center gap-2 text-blue-400">
                    <ArrowLeft size={18} /> Parent Organizer
                </Link>

                <h1 className="text-3xl font-bold">Subcategory Game Organizer</h1>

                {error && <p className="rounded-lg bg-red-950 p-3 text-red-300">{error}</p>}
                {message && <p className="rounded-lg bg-green-950 p-3 text-green-300">{message}</p>}

                <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                >
                    {categories.map((category) => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                </select>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <h2 className="text-xl font-bold">Available Games</h2>

                        {allGames.map((game) => (
                            <button
                                key={game._id}
                                onClick={() => addGame(game)}
                                className="flex w-full items-center gap-3 rounded-lg bg-slate-800 p-3 text-left"
                            >
                                {game.image?.url && (
                                    <img src={game.image.url} alt="" className="h-10 w-10 rounded object-cover" />
                                )}
                                <span className="flex-1">{game.name}</span>
                                <span className="text-blue-400">+ Add</span>
                            </button>
                        ))}
                    </section>

                    <section className="space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <h2 className="text-xl font-bold">Selected Games</h2>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={onDragEnd}
                        >
                            <SortableContext
                                items={selectedGames.map((game) => game._id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {selectedGames.map((game) => (
                                        <SortableGame key={game._id} game={game} remove={removeGame} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        <button
                            onClick={save}
                            disabled={!subcategoryId}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 p-3 font-semibold"
                        >
                            <Save size={19} /> Save Games
                        </button>
                    </section>
                </div>
            </div>
        </main>
    );
}
