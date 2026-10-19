
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";
import { LayoutDashboard, FolderOpen, Gamepad2, LogOut, GripVertical, Settings, Wallet, ClipboardList, Banknote, PanelsTopLeft } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminDashboard() {
    const router = useRouter();
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem("adminToken");

        if (!token) {
            router.replace("/admin/login");
            return;
        }

        fetch(`${API}/api/admin/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async (response) => {
                if (!response.ok) throw new Error("Unauthorized");
                const data = await response.json();
                setAdmin(data.admin);
            })
            .catch(() => {
                sessionStorage.removeItem("adminToken");
                router.replace("/admin/login");
            })
            .finally(() => setLoading(false));
    }, [router]);

    function logout() {
        sessionStorage.removeItem("adminToken");
        router.replace("/admin/login");
    }

    if (loading || !admin) {
        return (
            <main className="min-h-screen bg-slate-950 text-white grid place-items-center">
                Loading...
            </main>
        );
    }

    const links = [
        { title: "Categories", href: "/admin/categories", icon: FolderOpen },
        { title: "Games", href: "/admin/games", icon: Gamepad2 },
        { title: "Drag & Drop Organizer", href: "/admin/organizer", icon: GripVertical },
        { title: "Announcements", href: "/admin/announcements", icon: Megaphone },
        { title: "Contact Settings", href: "/admin/contact-settings", icon: Settings },
        { title: "Deposit Settings", href: "/admin/deposit-settings", icon: Wallet },
        { title: "Deposit Requests", href: "/admin/deposit-requests", icon: ClipboardList },
        { title: "Withdrawal Requests", href: "/admin/withdrawal-requests", icon: Banknote },
        { title: "Popup Management", href: "/admin/popups", icon: PanelsTopLeft }
    ];

    return (
        <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
            <div className="mx-auto max-w-5xl">
                <header className="flex items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <LayoutDashboard /> Admin Dashboard
                        </h1>
                        <p className="text-slate-400 mt-2">{admin.email}</p>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-3 hover:bg-red-500"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {links.map(({ title, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-900 p-7 hover:border-blue-500"
                        >
                            <Icon size={32} className="text-blue-400" />
                            <span className="text-xl font-semibold">{title}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
