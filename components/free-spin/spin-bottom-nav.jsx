"use client";

import { useRouter } from "next/navigation";
import { Gift, Home, Percent, UserRound } from "lucide-react";

const navItems = [
    { label: "HOME", href: "/", icon: Home },
    { label: "PROMO", href: "/promo", icon: Percent }
];

const navItemsRight = [
    { label: "EARN", href: "/earn", icon: Gift },
    { label: "MINE", href: "/mine", icon: UserRound }
];

function NavButton({ item, onNavigate }) {
    const Icon = item.icon;
    return (
        <button
            type="button"
            onClick={() => {
                sessionStorage.setItem(
                    "openHomeSection",
                    item.href.slice(1) || "home"
                );
                window.location.assign("/");
            }}
            className="flex flex-col items-center gap-0.5"
        >
            <span className="flex size-12 items-center justify-center rounded-full border-2 border-[#e7b84a] bg-gradient-to-b from-[#3b2a8a] to-[#1a0f4f] shadow-[0_0_10px_rgba(255,200,60,0.45)]">
                <Icon size={22} className="text-[#ffd257]" aria-hidden="true" />
            </span>
            <span className="text-[11px] font-bold text-white">{item.label}</span>
        </button>
    );
}

export default function SpinBottomNav() {
    const router = useRouter();

    return (
        <nav
            aria-label="Main"
            className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[496px] border-t border-indigo-400/20 bg-gradient-to-b from-[#1d1060]/95 to-[#0b0530] px-3 pb-2 pt-2 backdrop-blur"
        >
            <div className="flex items-end justify-between">
                <div className="flex gap-3">
                    {navItems.map((item) => (
                        <NavButton key={item.label} item={item} onNavigate={router.push} />
                    ))}
                </div>

                <button
                    type="button"
                    aria-current="page"
                    className="-mt-8 flex flex-col items-center"
                >
                    <span
                        aria-hidden="true"
                        className="size-16 rounded-full border-4 border-[#f3c766] shadow-[0_0_18px_rgba(255,200,60,0.6)]"
                        style={{
                            background:
                                "conic-gradient(#ef4444 0 45deg,#f59e0b 0 90deg,#22c55e 0 135deg,#3b82f6 0 180deg,#a855f7 0 225deg,#ec4899 0 270deg,#14b8a6 0 315deg,#eab308 0 360deg)"
                        }}
                    />
                    <span className="mt-1 rounded-md bg-[#2a1670] px-4 py-1 text-sm font-bold text-[#ffd257]">
                        Get 1500
                    </span>
                </button>

                <div className="flex gap-3">
                    {navItemsRight.map((item) => (
                        <NavButton key={item.label} item={item} onNavigate={router.push} />
                    ))}
                </div>
            </div>
        </nav>
    );
}
