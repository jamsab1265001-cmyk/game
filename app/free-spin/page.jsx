"use client";

import { useEffect, useRef, useState } from "react";
import SpinHeader from "@/components/free-spin/spin-header";
import AmountPanel from "@/components/free-spin/amount-panel";
import PrizeWheel, { WHEEL_SEGMENTS } from "@/components/free-spin/prize-wheel";
import InviteCard from "@/components/free-spin/invite-card";
import RecordList from "@/components/free-spin/record-list";
import SpinBottomNav from "@/components/free-spin/spin-bottom-nav";

const SEGMENT_ANGLE = 360 / WHEEL_SEGMENTS.length;
const SPIN_DURATION_MS = 5000;
const AWARD_EXPIRES_IN = 14 * 86400 + 23 * 3600 + 40 * 60 + 33;
const NEXT_SPIN_IN = 7 * 3600 + 6 * 60 + 16;

function formatClock(totalSeconds) {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
}

function formatTimestamp(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function useCountdown(initialSeconds) {
    const [seconds, setSeconds] = useState(initialSeconds);

    useEffect(() => {
        const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
        return () => clearInterval(id);
    }, []);

    return seconds;
}

export default function FreeSpinPage() {
    const [inviteCode, setInviteCode] = useState("");
    const [inviteLink, setInviteLink] = useState("");

    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "null");
            const code = user?.inviteCode || user?.referralCode;

            if (localStorage.getItem("userToken") && code) {
                setInviteCode(String(code));
                setInviteLink(
                    `${window.location.origin}/?referCode=${encodeURIComponent(code)}`
                );
            }
        } catch {
            setInviteCode("");
            setInviteLink("");
        }
    }, []);
    const [amount, setAmount] = useState(0);
    const [spinsLeft, setSpinsLeft] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [winIndex, setWinIndex] = useState(null);
    const [lastWin, setLastWin] = useState(null);
    const [records, setRecords] = useState([]);
    const recordRef = useRef(null);

    const expiresIn = useCountdown(AWARD_EXPIRES_IN);
    const nextSpinIn = useCountdown(NEXT_SPIN_IN);

    function handleSpin() {
        if (spinning || spinsLeft <= 0) return;

        const index = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
        const segment = WHEEL_SEGMENTS[index];
        const prize = segment.label === "0~20" ? Math.round(Math.random() * 2000) / 100 : segment.value;

        const targetAngle = (360 - index * SEGMENT_ANGLE) % 360;
        const current = ((rotation % 360) + 360) % 360;
        const delta = (targetAngle - current + 360) % 360;

        setWinIndex(null);
        setLastWin(null);
        setSpinning(true);
        setSpinsLeft((n) => n - 1);
        setRotation(rotation + 360 * 6 + delta);

        setTimeout(() => {
            setSpinning(false);
            setWinIndex(index);
            setLastWin(prize);
            setAmount((a) => a + prize);
            setRecords((list) => [
                { id: Date.now(), user: "****4910", amount: prize, time: formatTimestamp(new Date()) },
                ...list
            ]);
        }, SPIN_DURATION_MS);
    }

    function handleReceive() {
        setAmount(0);
        setLastWin(null);
    }

    return (
        <main className="relative mx-auto min-h-screen w-full max-w-[496px] overflow-x-hidden bg-[radial-gradient(ellipse_at_top,#4a1fa8_0%,#2a0f6b_38%,#120638_70%,#08031f_100%)] pb-32 text-white">
            <style>{`
                @keyframes fs-marquee { from { transform: translateX(0); } to { transform: translateX(-100%); } }
                .fs-marquee { display: inline-block; padding-left: 100%; animation: fs-marquee 22s linear infinite; }
                @media (prefers-reduced-motion: reduce) { .fs-marquee { animation: none; } }
            `}</style>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-24 h-[420px] bg-[radial-gradient(circle_at_50%_40%,rgba(140,110,255,0.35),transparent_60%)]"
            />

            <SpinHeader
                onOpenRules={() =>
                    window.alert("Spin the wheel to win rewards. Collect your award before the timer ends.")
                }
                onOpenRecords={() => recordRef.current?.scrollIntoView({ behavior: "smooth" })}
            />

            <AmountPanel
                amount={amount}
                expiresIn={expiresIn}
                onReceive={handleReceive}
                canReceive={amount > 0 && !spinning}
            />

            <PrizeWheel
                rotation={rotation}
                spinning={spinning}
                spinsLeft={spinsLeft}
                onSpin={handleSpin}
                nextSpinLabel={formatClock(nextSpinIn)}
                highlightIndex={winIndex}
            />

            <p className="sr-only" aria-live="polite">
                {lastWin !== null ? `You won ${lastWin.toFixed(2)}` : ""}
            </p>

            {lastWin !== null && (
                <div className="relative z-30 mx-auto mt-2 w-fit rounded-full border border-[#f3c766]/60 bg-[#2a1670]/90 px-4 py-1 text-sm font-semibold text-[#ffd257]">
                    {"You won +"}
                    {lastWin.toFixed(2)}
                </div>
            )}

            {inviteCode && inviteLink ? (
                <InviteCard inviteCode={inviteCode} inviteLink={inviteLink} />
            ) : (
                <p className="text-center text-sm text-white/70">
                    Your invitation code is not available yet.
                </p>
            )}

            <RecordList ref={recordRef} records={records} />

            <SpinBottomNav />
        </main>
    );
}
