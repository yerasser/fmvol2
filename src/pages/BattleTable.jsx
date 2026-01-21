import React, { useMemo, useState } from "react";

const keyOf = (roundIndex, matchIndex) => `${roundIndex}:${matchIndex}`;

function parseNames(text) {
    return text
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
}

function buildRounds(players, winnersMap) {
    const rounds = [];
    let current = [...players];
    let r = 0;

    while (current.length > 1) {
        const matches = [];
        let i = 0;

        while (i < current.length) {
            const remaining = current.length - i;

            if (remaining === 3) {
                matches.push({
                    participants: [current[i], current[i + 1], current[i + 2]],
                    winner: null,
                });
                i += 3;
                continue;
            }

            if (remaining >= 2) {
                matches.push({ participants: [current[i], current[i + 1]], winner: null });
                i += 2;
            } else {
                matches.push({ participants: [current[i]], winner: current[i] ?? null });
                i += 1;
            }
        }

        for (let m = 0; m < matches.length; m++) {
            const parts = matches[m].participants.filter(Boolean);
            const k = keyOf(r, m);

            if (parts.length === 1) {
                matches[m].winner = parts[0] ?? null;
                continue;
            }

            if (parts.length !== matches[m].participants.length) {
                matches[m].winner = null;
                continue;
            }

            const picked = winnersMap[k] ?? null;
            matches[m].winner = parts.includes(picked) ? picked : null;
        }

        rounds.push(matches);

        current = matches.map((m) => m.winner ?? null).filter(Boolean);
        r += 1;
    }

    return { rounds, champion: current[0] ?? null };
}

function PlayerBtn({ name, active, disabled, onClick }) {
    const base =
        "w-full text-left px-3 py-2 rounded-lg border text-sm transition select-none";

    const cls = disabled
        ? `${base} border-black/10 bg-black/[0.03] text-black/35 cursor-not-allowed`
        : active
            ? `${base} border-black/60 bg-black text-[#f5f2ec] hover:bg-black/90`
            : `${base} border-black/20 bg-white/50 text-black/80 hover:bg-white/70 hover:border-black/35`;

    return (
        <button type="button" className={cls} disabled={disabled} onClick={onClick}>
            {name}
        </button>
    );
}

export default function BattleBracketPairsAndTriple() {
    const [namesText, setNamesText] = useState("");
    const [players, setPlayers] = useState(() => parseNames(namesText));
    const [winnersMap, setWinnersMap] = useState({});

    const { rounds} = useMemo(
        () => buildRounds(players, winnersMap),
        [players, winnersMap]
    );

    function regenerate() {
        setPlayers(parseNames(namesText));
        setWinnersMap({});
    }

    function resetAll() {
        setWinnersMap({});
    }

    function pickWinner(roundIndex, matchIndex, pickedName) {
        setWinnersMap((prev) => {
            const next = { ...prev };
            next[keyOf(roundIndex, matchIndex)] = pickedName;

            Object.keys(next).forEach((k) => {
                const [rStr] = k.split(":");
                const r = Number(rStr);
                if (r > roundIndex) delete next[k];
            });

            return next;
        });
    }

    return (
        <div className="min-h-screen bg-[#f5f2ec] text-black">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="flex flex-col gap-6">
                    <div className="rounded-2xl border border-black/15 bg-[#f7f4ee] p-5 shadow-[0_6px_30px_-20px_rgba(0,0,0,0.35)]">
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
              <textarea
                  className="h-40 w-full resize-none rounded-xl border border-black/15 bg-white/55 p-3 text-sm outline-none focus:border-black/30"
                  value={namesText}
                  onChange={(e) => setNamesText(e.target.value)}
                  placeholder="Имена, по одному на строку"
              />

                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={regenerate}
                                    className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-[#f5f2ec] hover:bg-black/90 border border-black/70"
                                >
                                    Сгенерировать
                                </button>

                                <button
                                    type="button"
                                    onClick={resetAll}
                                    className="rounded-xl bg-transparent px-4 py-3 text-sm font-medium border border-black/25 text-black/80 hover:bg-white/50"
                                >
                                    Сбросить результаты
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-black/15 bg-[#f7f4ee] p-5 shadow-[0_6px_30px_-20px_rgba(0,0,0,0.35)]">
                        <div className="overflow-x-auto">
                            <div className="flex gap-6 min-w-max">
                                {rounds.map((round, rIndex) => (
                                    <div key={rIndex} className="w-72">
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="text-sm font-semibold tracking-tight">
                                                Round {rIndex + 1}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            {round.map((m, mIndex) => {
                                                const parts = m.participants;
                                                const allReady = parts.every(Boolean);
                                                const isSolo = parts.length === 1;

                                                return (
                                                    <div
                                                        key={mIndex}
                                                        className="rounded-2xl border border-black/15 bg-white/45 p-3"
                                                    >
                                                        <div className="flex flex-col gap-2">
                                                            {parts.map((p, idx) => (
                                                                <PlayerBtn
                                                                    key={idx}
                                                                    name={p || "—"}
                                                                    active={m.winner === p && !!p}
                                                                    disabled={!p || (!allReady && !isSolo) || isSolo}
                                                                    onClick={() => {
                                                                        if (!p) return;
                                                                        if (!allReady) return;
                                                                        pickWinner(rIndex, mIndex, p);
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>

                                                        <div className="mt-3 text-xs">
                                                            <span className="text-black/55">Победитель: </span>
                                                            {m.winner ? (
                                                                <span className="text-black font-medium">
                                  {m.winner}
                                </span>
                                                            ) : (
                                                                <span className="text-black/35">—</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
