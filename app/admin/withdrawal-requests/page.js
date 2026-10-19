
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X, RefreshCw } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function WithdrawalRequestsPage() {
    const router = useRouter();
    const [withdrawals, setWithdrawals] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function request(path, options = {}) {
        const token = sessionStorage.getItem("adminToken");

        const response = await fetch(`${API}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                ...(options.body ? { "Content-Type": "application/json" } : {})
            },
            cache: "no-store"
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
            router.replace("/admin/login");
            throw new Error("Session expired");
        }

        if (!response.ok) {
            throw new Error(data.message || "Request failed");
        }

        return data;
    }

    async function loadWithdrawals() {
        setLoading(true);

        try {
            const data = await request("/api/withdrawal-requests/admin");
            setWithdrawals(data.withdrawals || []);
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

        loadWithdrawals();
    }, []);

    async function reviewWithdrawal(item, action) {
        let payoutReference = "";

        if (action === "approve") {
            payoutReference = window.prompt(
                "Payment bhejne ke baad asli payout transaction/reference ID enter karein:"
            );

            if (!payoutReference?.trim()) return;

            if (
                !window.confirm(
                    `Kya Rs ${item.amount} ki payment recipient ko successfully bhej di hai?`
                )
            ) return;
        } else {
            if (!window.confirm(`Reject withdrawal of Rs ${item.amount}?`)) return;
        }

        setProcessing(item._id);
        setError("");
        setSuccess("");

        try {
            const data = await request(
                `/api/withdrawal-requests/${item._id}/${action}`,
                {
                    method: "PATCH",
                    ...(action === "approve"
                        ? { body: JSON.stringify({ payoutReference }) }
                        : {})
                }
            );

            setSuccess(data.message || "Request updated");
            await loadWithdrawals();
        } catch (err) {
            setError(err.message);
            await loadWithdrawals();
        } finally {
            setProcessing("");
        }
    }

    const filtered = withdrawals.filter(
        (item) => filter === "all" || item.status === filter
    );

    const pending = withdrawals.filter((w) => w.status === "pending").length;
    const approved = withdrawals.filter((w) => w.status === "approved").length;
    const rejected = withdrawals.filter((w) => w.status === "rejected").length;

    return (
        <main className="min-h-screen bg-slate-950 p-5 text-white md:p-10">
            <div className="mx-auto max-w-6xl space-y-6">
                <Link href="/admin" className="flex items-center gap-2 text-blue-400">
                    <ArrowLeft size={18} /> Dashboard
                </Link>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-3xl font-bold">Withdrawal Requests</h1>

                    <button
                        type="button"
                        onClick={loadWithdrawals}
                        className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2"
                    >
                        <RefreshCw size={18} /> Refresh
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

                <div className="grid grid-cols-3 gap-3">
                    {[
                        ["Pending", pending],
                        ["Approved", approved],
                        ["Rejected", rejected]
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-slate-900 p-4">
                            <p className="text-sm text-slate-400">{label}</p>
                            <strong className="text-xl">{value}</strong>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    {["all", "pending", "approved", "rejected"].map((status) => (
                        <button
                            type="button"
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`rounded-lg px-4 py-2 capitalize ${filter === status ? "bg-blue-600" : "bg-slate-800"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p>Loading withdrawals...</p>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((item) => (
                            <article
                                key={item._id}
                                className="space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-5"
                            >
                                <div className="flex justify-between gap-3">
                                    <h2 className="text-xl font-bold">
                                        Rs {item.amount.toLocaleString()}
                                    </h2>
                                    <span className="capitalize text-yellow-400">
                                        {item.status}
                                    </span>
                                </div>

                                <p>User: {item.user?.mobile || "Unknown"}</p>
                                <p>Method: {item.method}</p>
                                <p className="break-all">
                                    Account: {item.accountDetails}
                                </p>

                                {item.accountTitle && (
                                    <p>Account Title: {item.accountTitle}</p>
                                )}

                                {item.payoutReference && (
                                    <p>Payout Reference: {item.payoutReference}</p>
                                )}

                                <p className="text-xs text-slate-400">
                                    {new Date(item.createdAt).toLocaleString()}
                                </p>

                                {item.status === "pending" && (
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            disabled={!!processing}
                                            onClick={() => reviewWithdrawal(item, "approve")}
                                            className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 disabled:opacity-50"
                                        >
                                            <Check size={18} /> Approve
                                        </button>

                                        <button
                                            type="button"
                                            disabled={!!processing}
                                            onClick={() => reviewWithdrawal(item, "reject")}
                                            className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-3 disabled:opacity-50"
                                        >
                                            <X size={18} /> Reject
                                        </button>
                                    </div>
                                )}
                            </article>
                        ))}

                        {!filtered.length && (
                            <p className="rounded-xl bg-slate-900 p-6 text-center text-slate-400">
                                No withdrawal requests found.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
