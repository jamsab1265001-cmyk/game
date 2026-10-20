import Image from "next/image";
import { Banknote, Coins } from "lucide-react";

export const WHEEL_SEGMENTS = [
    { label: "27", value: 27 },
    { label: "77", value: 77 },
    { label: "87", value: 87 },
    { label: "0~20", value: 20 },
    { label: "177", value: 177 },
    { label: "57", value: 57 },
    { label: "37", value: 37 },
    { label: "200", value: 200 }
];

const SEGMENT_ANGLE = 360 / WHEEL_SEGMENTS.length;

const outerGradient = `conic-gradient(from -${SEGMENT_ANGLE / 2}deg, ${WHEEL_SEGMENTS.map((_, i) => {
    const color = i % 2 === 0 ? "#3d6fe0" : "#5d8ff0";
    return `${color} ${i * SEGMENT_ANGLE}deg ${(i + 1) * SEGMENT_ANGLE}deg`;
}).join(", ")})`;

const innerGradient = `conic-gradient(from -${SEGMENT_ANGLE / 2}deg, ${WHEEL_SEGMENTS.map((_, i) => {
    const color = i % 2 === 0 ? "#a9c4fb" : "#c7d8ff";
    return `${color} ${i * SEGMENT_ANGLE}deg ${(i + 1) * SEGMENT_ANGLE}deg`;
}).join(", ")})`;

function Bulbs() {
    return Array.from({ length: 24 }).map((_, i) => (
        <span
            key={i}
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 size-2 rounded-full bg-[#ffe8a3] shadow-[0_0_8px_2px_rgba(255,220,120,0.9)] odd:animate-pulse"
            style={{ transform: `translate(-50%, -50%) rotate(${i * 15}deg) translateY(-145px)` }}
        />
    ));
}

export default function PrizeWheel({ rotation, spinning, spinsLeft, onSpin, nextSpinLabel, highlightIndex }) {
    return (
        <section aria-label="Free spin wheel" className="relative mx-auto mt-4 flex w-full max-w-[420px] flex-col items-center px-2">
            <Image
                src="/free-spin/tiger.png"
                alt=""
                width={120}
                height={120}
                className="pointer-events-none absolute -left-3 -top-4 z-20 w-32 [mask-image:radial-gradient(circle,black_50%,transparent_70%)]"
                priority
            />
            <Image
                src="/free-spin/chest.png"
                alt=""
                width={140}
                height={140}
                className="pointer-events-none absolute -left-4 bottom-4 z-20 w-36 [mask-image:radial-gradient(circle,black_52%,transparent_70%)]"
            />
            <Image
                src="/free-spin/mouse.png"
                alt=""
                width={140}
                height={140}
                className="pointer-events-none absolute -right-4 bottom-0 z-20 w-36 [mask-image:radial-gradient(circle,black_52%,transparent_70%)]"
            />

            <div className="relative size-[310px]">
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#ffe08a] via-[#c48a1e] to-[#7a4a0c] p-[5px] shadow-[0_0_40px_rgba(120,90,255,0.6)]">
                    <div className="relative size-full rounded-full bg-gradient-to-b from-[#2b2fa8] to-[#151566] p-[10px]">
                        <Bulbs />
                        <div
                            className="relative size-full rounded-full border-2 border-[#f3c766] transition-transform ease-[cubic-bezier(0.17,0.67,0.12,0.99)]"
                            style={{
                                background: outerGradient,
                                transform: `rotate(${rotation}deg)`,
                                transitionDuration: spinning ? "5000ms" : "0ms"
                            }}
                        >
                            {WHEEL_SEGMENTS.map((segment, i) => (
                                <div
                                    key={segment.label}
                                    className="absolute inset-0"
                                    style={{ transform: `rotate(${i * SEGMENT_ANGLE}deg)` }}
                                >
                                    <span
                                        aria-hidden="true"
                                        className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom bg-white/30"
                                        style={{ transform: `rotate(${SEGMENT_ANGLE / 2}deg)` }}
                                    />
                                    <span
                                        className={`absolute left-1/2 top-3 -translate-x-1/2 text-lg font-semibold tracking-wide ${
                                            highlightIndex === i ? "text-[#ffe066]" : "text-white"
                                        }`}
                                    >
                                        {segment.label}
                                    </span>
                                </div>
                            ))}

                            <div
                                className="absolute inset-[22%] rounded-full shadow-[inset_0_0_14px_rgba(30,40,140,0.45)]"
                                style={{ background: innerGradient }}
                            >
                                {WHEEL_SEGMENTS.map((segment, i) => (
                                    <div
                                        key={segment.label}
                                        className="absolute inset-0"
                                        style={{ transform: `rotate(${i * SEGMENT_ANGLE}deg)` }}
                                        aria-hidden="true"
                                    >
                                        <span className="absolute left-1/2 top-2 -translate-x-1/2">
                                            {i % 2 === 0 ? (
                                                <Coins size={30} className="fill-[#ffcf3f] text-[#b47708] drop-shadow" />
                                            ) : (
                                                <Banknote size={30} className="fill-[#9be15d] text-[#3f8a17] drop-shadow" />
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {highlightIndex !== null && !spinning && (
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: `conic-gradient(from ${highlightIndex * SEGMENT_ANGLE - SEGMENT_ANGLE / 2}deg, rgba(255,230,140,0.45) 0deg ${SEGMENT_ANGLE}deg, transparent ${SEGMENT_ANGLE}deg)`
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-[-6px] z-10 size-4 -translate-x-1/2 rotate-45 rounded-sm bg-gradient-to-br from-[#ffe9a8] to-[#c47d0e] shadow"
                />
                <span
                    aria-hidden="true"
                    className="absolute bottom-[-6px] left-1/2 z-10 size-4 -translate-x-1/2 rotate-45 rounded-sm bg-gradient-to-br from-[#ffe9a8] to-[#c47d0e] shadow"
                />

                <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                    <span
                        aria-hidden="true"
                        className="mb-[-6px] h-0 w-0 border-x-[10px] border-b-[22px] border-x-transparent border-b-[#f6d06b] drop-shadow"
                    />
                    <button
                        type="button"
                        onClick={onSpin}
                        disabled={spinning || spinsLeft <= 0}
                        aria-label={`Spin the wheel, ${spinsLeft} free spins left`}
                        className="flex size-[78px] flex-col items-center justify-center rounded-full border-4 border-[#f7d57a] bg-gradient-to-b from-[#fff2c2] via-[#ffd76a] to-[#e0a52a] shadow-[0_0_0_4px_rgba(160,110,255,0.6),0_6px_18px_rgba(0,0,0,0.45)] transition enabled:hover:scale-105 enabled:active:scale-95 disabled:cursor-not-allowed"
                    >
                        <span className="text-2xl font-black leading-none text-[#7a3b05]">X{spinsLeft}</span>
                        <span className="text-[10px] font-semibold text-[#8a4a0a]">Free Spin</span>
                    </button>
                </div>
            </div>

            <p className="relative z-30 mt-4 text-sm text-white/85">
                Next Free Spin:{" "}
                <span className="font-mono font-semibold text-white">{nextSpinLabel}</span>
            </p>
        </section>
    );
}
