"use client";

import { useState } from "react";
import { Check, Copy, Send, Share2 } from "lucide-react";

function CopyButton({ value, label }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Copied" : `Copy ${label}`}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-white/80 transition hover:bg-white/10 hover:text-white"
        >
            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
        </button>
    );
}

function FacebookIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-7 fill-white" aria-hidden="true">
            <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v9h4v-9h3l1-4h-4V9c0-.6.4-1 1-1z" />
        </svg>
    );
}

function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-7 fill-white" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-1-1.1-1.3-1.7-.1-.2 0-.4.1-.5l.4-.5.2-.4v-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.6.6-.9 1.4-.9 2.2.1 1 .5 2 1.1 2.8 1.2 1.7 2.7 3 4.6 3.8.5.2 1 .4 1.5.5.6.2 1.2.1 1.7-.1.6-.3 1-.8 1.2-1.4.1-.3.1-.7 0-1-.1-.1-.3-.2-.5-.3z" />
        </svg>
    );
}

export default function InviteCard({ inviteCode, inviteLink }) {
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=6&data=${encodeURIComponent(inviteLink)}`;
    const encodedLink = encodeURIComponent(inviteLink);

    const shareTargets = [
        {
            name: "FaceBook",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`,
            className: "bg-[#1877f2]",
            icon: <FacebookIcon />
        },
        {
            name: "WhatsApp",
            href: `https://wa.me/?text=${encodedLink}`,
            className: "bg-[#25d366]",
            icon: <WhatsAppIcon />
        },
        {
            name: "Telegram",
            href: `https://t.me/share/url?url=${encodedLink}`,
            className: "bg-[#2aabee]",
            icon: <Send size={24} className="-ml-0.5 fill-white text-white" />
        }
    ];

    async function handleNativeShare() {
        if (navigator.share) {
            try {
                await navigator.share({ title: "Join me", url: inviteLink });
            } catch {
                // user dismissed the share sheet
            }
        } else {
            await navigator.clipboard?.writeText(inviteLink);
        }
    }

    return (
        <section
            aria-labelledby="invite-title"
            className="relative z-30 mx-3 mt-4 rounded-xl border border-indigo-400/30 bg-[#120a3d]/90 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur"
        >
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                <h2 id="invite-title" className="text-sm font-medium text-white">
                    Invite friends
                </h2>
                <div className="flex min-w-0 items-center gap-1.5 text-sm">
                    <span className="text-sky-400">My invitation code</span>
                    <span className="truncate font-medium text-white">{inviteCode}</span>
                    <CopyButton value={inviteCode} label="invitation code" />
                </div>
            </div>

            <div className="mt-3 flex gap-4">
                <div className="flex w-[104px] shrink-0 flex-col overflow-hidden rounded-lg border border-indigo-300/40 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrSrc} alt="QR code for your invitation link" className="aspect-square w-full" crossOrigin="anonymous" />
                    <a
                        href={qrSrc}
                        download="invite-qr.png"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#4a3aa8] py-1 text-center text-sm text-white transition hover:bg-[#5a49c2]"
                    >
                        save
                    </a>
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm text-sky-400">My invitation link</p>
                    <div className="mt-2 flex items-center gap-1.5">
                        <p className="min-w-0 flex-1 truncate rounded-md border border-white/30 bg-white/5 px-2 py-1.5 text-xs text-white">
                            {inviteLink}
                        </p>
                        <CopyButton value={inviteLink} label="invitation link" />
                    </div>

                    <ul className="mt-3 flex items-start justify-between gap-1">
                        <li className="flex flex-col items-center gap-1">
                            <button
                                type="button"
                                onClick={handleNativeShare}
                                aria-label="Share"
                                className="flex size-11 items-center justify-center rounded-full border border-white/40 text-sky-400 transition hover:bg-white/10"
                            >
                                <Share2 size={20} />
                            </button>
                            <span className="text-[11px] text-white/90">Share</span>
                        </li>
                        {shareTargets.map((target) => (
                            <li key={target.name} className="flex flex-col items-center gap-1">
                                <a
                                    href={target.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`Share on ${target.name}`}
                                    className={`flex size-11 items-center justify-center rounded-full transition hover:brightness-110 ${target.className}`}
                                >
                                    {target.icon}
                                </a>
                                <span className="text-[11px] text-white/90">{target.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
