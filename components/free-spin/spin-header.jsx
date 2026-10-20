"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, CircleHelp, FileClock, Volume2 } from "lucide-react";

const tickerMessages = [
    "****4685 successfully withdrew Rs 1,407.73",
    "****2291 won 200 on Free Spin",
    "****7730 successfully withdrew Rs 12,100.00",
    "****1048 invited 5 friends and earned 500"
];

export default function SpinHeader({ onOpenRules, onOpenRecords }) {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-30 flex items-center gap-2 bg-[#1a0b4a]/80 px-3 py-2 backdrop-blur-md">
            <button
                type="button"
                onClick={() => router.push("/")}
                aria-label="Go back"
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-sky-300 transition hover:bg-white/10"
            >
                <ChevronLeft size={28} strokeWidth={2.5} />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-md border border-indigo-400/30 bg-[#0d0636]/80 px-2 py-1.5">
                <Volume2 size={16} className="shrink-0 text-sky-300" aria-hidden="true" />
                <div className="relative min-w-0 flex-1 overflow-hidden" aria-live="off">
                    <p className="fs-marquee whitespace-nowrap text-xs text-white/90">
                        {tickerMessages.join("     •     ")}
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={onOpenRules}
                aria-label="Rules"
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-sky-300 transition hover:bg-white/10"
            >
                <CircleHelp size={24} />
            </button>
            <button
                type="button"
                onClick={onOpenRecords}
                aria-label="View records"
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-sky-300 transition hover:bg-white/10"
            >
                <FileClock size={24} />
            </button>
        </header>
    );
}
