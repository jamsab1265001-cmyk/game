
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X, RefreshCw } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DepositRequestsPage() {
    const router = useRouter();
    const [deposits, setDeposits] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function request(path, options = {}) {
        const token = sessionStorage.getItem("adminToken");

        const res = await fetch(`${API}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                ...(options.body ? { "Content-Type": "application/json" } : {})
            },
            cache: "no-store"
        });

        const data = await res.json();

        if (res.status === 401 || res.status === 403) {
            router.replace("/admin/login");
            throw new Error("Session expired");
        }

        if (!res.ok) {
            throw new Error(data.message || "Request failed");
        }

        return data;
    }

    async function loadDeposits() {
        setLoading(true);

        try {
            const data = await request("/api/deposit-requests/admin");
            setDeposits(data.deposits || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!sessionStorage.getItem("adminToken")) {
            router.replace("/admin/login");
            return;
        }

        loadDeposits();
    }, []);

    async function reviewDeposit(item, action) {
        const confirmation =
            action === "approve"
                ? `Have you verified payment of Rs ${item.amount} with the payment provider? Approving will credit this amount to the user's balance.`
                : `Reject deposit request of Rs ${item.amount}?`;

        if (!window.confirm(confirmation)) return;

        setProcessing(item._id);
        setError("");
        setSuccess("");

        try {
            const data = await request(
                `/api/deposit-requests/${item._id}/${action}`,
                { method: "PATCH" }
            );

            setSuccess(data.message || `Deposit ${action}d successfully`);
            await loadDeposits();
        } catch (err) {
            setError(err.message);
            await loadDeposits();
        } finally {
            setProcessing("");
        }
    }

    const filtered = deposits.filter(
        (item) => filter === "all" || item.status === filter
    );

    const stats = {
        pending: deposits.filter((d) => d.status === "pending").length,
        approved: deposits.filter((d) => d.status === "approved").length,
        rejected: deposits.filter((d) => d.status === "rejected").length,
        approvedAmount: deposits
            .filter((d) => d.status === "approved")
            .reduce((sum, d) => sum + d.amount, 0)
    };

    return (
        <main className="min-h-screen bg-slate-950 p-5 text-white md:p-10">
            <div className="mx-auto max-w-6xl space-y-6">
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-blue-400"
                >
                    <ArrowLeft size={18} />
                    Dashboard
                </Link>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-3xl font-bold">Deposit Requests</h1>

                    <button
                        type="button"
                        onClick={loadDeposits}
                        className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>

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

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                        ["Pending", stats.pending],
                        ["Approved", stats.approved],
                        ["Rejected", stats.rejected],
                        ["Total Approved (Rs)", stats.approvedAmount.toLocaleString()]
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-xl border border-slate-700 bg-slate-900 p-4"
                        >
                            <p className="text-sm text-slate-400">{label}</p>
                            <strong className="mt-2 block text-xl">{value}</strong>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    {["all", "pending", "approved", "rejected"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`rounded-lg px-4 py-2 capitalize ${filter === status
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-800 text-slate-300"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p>Loading deposit requests...</p>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((item) => (
                            <article
                                key={item._id}
                                className="rounded-xl border border-slate-700 bg-slate-900 p-5"
                            >
                                <div className="flex flex-wrap justify-between gap-3">
                                    <div className="space-y-2">
                                        <h2 className="text-xl font-bold">
                                            Rs {item.amount.toLocaleString()}
                                        </h2>

                                        <p className="text-sm text-slate-300">
                                            User: {item.user?.mobile || "Unknown"}
                                        </p>

                                        <p className="text-sm">
                                            {item.method} — {item.channel}
                                        </p>

                                        <p className="break-all text-sm text-slate-300">
                                            Transaction ID: {item.transactionId}
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <span
                                        className={`h-fit rounded-lg px-3 py-1 text-sm capitalize ${item.status === "approved"
                                                ? "bg-green-900 text-green-300"
                                                : item.status === "rejected"
                                                    ? "bg-red-900 text-red-300"
                                                    : "bg-yellow-900 text-yellow-300"
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>

                                {item.status === "pending" && (
                                    <div className="mt-5 flex gap-3">
                                        <button
                                            type="button"
                                            disabled={!!processing}
                                            onClick={() => reviewDeposit(item, "approve")}
                                            className="flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 font-semibold disabled:opacity-50"
                                        >
                                            <Check size={18} />
                                            Approve
                                        </button>

                                        <button
                                            type="button"
                                            disabled={!!processing}
                                            onClick={() => reviewDeposit(item, "reject")}
                                            className="flex items-center gap-2 rounded-lg bg-red-700 px-5 py-3 font-semibold disabled:opacity-50"
                                        >
                                            <X size={18} />
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </article>
                        ))}

                        {!filtered.length && (
                            <p className="rounded-xl bg-slate-900 p-6 text-center text-slate-400">
                                No deposit requests found.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
