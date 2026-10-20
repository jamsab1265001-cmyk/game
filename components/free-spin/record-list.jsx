import { forwardRef } from "react";
import { UserRound } from "lucide-react";

const RecordList = forwardRef(function RecordList({ records }, ref) {
    return (
        <section
            ref={ref}
            aria-labelledby="record-title"
            className="relative z-30 mx-3 mt-4 rounded-xl border border-indigo-400/30 bg-[#120a3d]/90 p-4 backdrop-blur"
        >
            <h2 id="record-title" className="flex items-center gap-2 text-sm font-semibold text-white">
                <span aria-hidden="true" className="h-4 w-1 rounded-full bg-gradient-to-b from-[#ffe08a] to-[#c48a1e]" />
                Record
            </h2>

            {records.length ? (
                <ul className="mt-3 divide-y divide-white/5">
                    {records.map((record) => (
                        <li key={record.id} className="flex items-center justify-between gap-3 py-3">
                            <div className="flex items-center gap-2">
                                <span className="flex size-8 items-center justify-center rounded-full border border-sky-400/60 bg-gradient-to-b from-[#3a2a8c] to-[#1d1258]">
                                    <UserRound size={16} className="text-sky-200" aria-hidden="true" />
                                </span>
                                <span className="text-sm text-white/90">{record.user}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold text-white">{record.amount.toFixed(2)}</p>
                                <p className="text-xs text-white/70">{record.time}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="py-6 text-center text-sm text-white/60">No records yet. Spin to win!</p>
            )}
        </section>
    );
});

export default RecordList;
