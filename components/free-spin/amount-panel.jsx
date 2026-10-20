function formatDuration(totalSeconds) {
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${d}d:${h}h:${m}m:${s}s`;
}

export default function AmountPanel({ amount, expiresIn, onReceive, canReceive }) {
    return (
        <section aria-labelledby="my-amount" className="relative z-10 flex flex-col items-center px-4 pt-3 text-center">
            <h2 id="my-amount" className="text-lg font-medium text-pink-300">
                My Amount{" "}
                <span className="font-mono text-[#ff8ab3]">[{formatDuration(expiresIn)}]</span>
            </h2>

            <p
                className="mt-1 bg-gradient-to-b from-[#fff6c9] via-[#ffd35a] to-[#c98a12] bg-clip-text text-5xl font-black tracking-tight text-transparent drop-shadow-[0_3px_0_rgba(60,20,0,0.6)]"
                aria-live="polite"
            >
                {amount.toFixed(2)}
            </p>

            <button
                type="button"
                onClick={onReceive}
                disabled={!canReceive}
                className="mt-3 rounded-full border border-white/15 bg-gradient-to-b from-[#4b3a9e] to-[#2a1d6b] px-7 py-2 text-lg font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_20px_rgba(20,0,80,0.5)] transition enabled:hover:brightness-110 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
                Receive the award
            </button>
        </section>
    );
}
