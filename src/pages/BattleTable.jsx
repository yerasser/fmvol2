import React, { useEffect, useMemo, useState } from "react";

const keyOf = (roundIndex, matchIndex) => `${roundIndex}:${matchIndex}`;
const STORAGE_KEY = "battle_bracket_last_v1";

function parseNames(text) {
    return text
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function safeParse(json) {
    try {
        return JSON.parse(json);
    } catch {
        return null;
    }
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

function PlayerBtn({ name, active, disabled, onClick, onDelete }) {
    const base =
        "w-full px-3 py-2 rounded-lg border text-sm transition select-none flex items-center justify-between gap-3";

    const cls = disabled
        ? `${base} border-black/10 bg-black/[0.03] text-black/35 cursor-not-allowed`
        : active
            ? `${base} border-black/60 bg-black text-[#f5f2ec] hover:bg-black/90`
            : `${base} border-black/20 bg-white/50 text-black/80 hover:bg-white/70 hover:border-black/35`;

    return (
        <div className={cls}>
            <button
                type="button"
                className="flex-1 text-left"
                disabled={disabled}
                onClick={onClick}
                title={name}
            >
                {name}
            </button>

            {onDelete ? (
                <button
                    type="button"
                    onClick={onDelete}
                    className={
                        disabled
                            ? "pointer-events-none opacity-40"
                            : "rounded-md px-2 py-1 text-xs border border-black/20 bg-white/60 hover:bg-white"
                    }
                    aria-label={`Удалить ${name}`}
                    title="Удалить"
                >
                    ✕
                </button>
            ) : null}
        </div>
    );
}

export default function BattleBracketPairsAndTriple() {
    const saved =
        typeof window !== "undefined"
            ? safeParse(localStorage.getItem(STORAGE_KEY))
            : null;

    const [namesText, setNamesText] = useState(() => saved?.namesText ?? "");
    const [players, setPlayers] = useState(() =>
        Array.isArray(saved?.players) ? saved.players : parseNames(saved?.namesText ?? "")
    );
    const [winnersMap, setWinnersMap] = useState(() =>
        saved?.winnersMap && typeof saved.winnersMap === "object" ? saved.winnersMap : {}
    );
    const [loadingPreset, setLoadingPreset] = useState(null); // "beginners" | "open" | null
    const [error, setError] = useState("");

    useEffect(() => {
        if (typeof window === "undefined") return;

        const payload = {
            namesText,
            players,
            winnersMap,
            savedAt: Date.now(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }, [namesText, players, winnersMap]);

    const { rounds } = useMemo(() => buildRounds(players, winnersMap), [players, winnersMap]);

    function regenerate() {
        const parsed = parseNames(namesText);
        setPlayers(shuffle(parsed));
        setWinnersMap({});
    }
    function regenerateWithoutShuffle() {
        const parsed = parseNames(namesText);
        setPlayers(parsed);
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

    function deleteParticipant(name) {
        if (!name) return;

        setPlayers((prev) => prev.filter((p) => p !== name));

        setWinnersMap((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((k) => {
                if (next[k] === name) delete next[k];
            });
            return next;
        });

        setNamesText((prev) => {
            const list = parseNames(prev).filter((p) => p !== name);
            return list.join("\n");
        });
    }

    async function loadPreset(type) {
        const url =
            type === "beginners"
                ? "https://script.google.com/macros/s/AKfycbyX2E8Hs_UA4NAqCggpRQgzrBfbZH0YAxtedo8Cr8dmqRpDz8ZMkdsnDud0Z-mAfwuE/exec?nomination=beginners"
                : "https://script.google.com/macros/s/AKfycbyX2E8Hs_UA4NAqCggpRQgzrBfbZH0YAxtedo8Cr8dmqRpDz8ZMkdsnDud0Z-mAfwuE/exec?nomination=open";

        setError("");
        setLoadingPreset(type);

        try {
            const res = await fetch(url, { method: "GET" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            const names = Array.isArray(data) ? data : data?.participants;

            if (!Array.isArray(names)) {
                throw new Error("Bad response format: expected array or { participants: [] }");
            }

            const cleaned = names.map((x) => String(x).trim()).filter(Boolean);
            const randomized = shuffle(cleaned);

            setNamesText(cleaned.join("\n"));
            setPlayers(randomized);
            setWinnersMap({});
        } catch (e) {
            setError(e?.message || "Fetch error");
        } finally {
            setLoadingPreset(null);
        }
    }

    function clearSaved() {
        if (typeof window === "undefined") return;
        localStorage.removeItem(STORAGE_KEY);
        setNamesText("");
        setPlayers([]);
        setWinnersMap({});
        setError("");
        setLoadingPreset(null);
    }

    return (
        <div className="min-h-screen bg-[#f5f2ec] text-black">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="flex flex-col gap-6">
                    <div className="rounded-2xl border border-black/15 bg-[#f7f4ee] p-5 shadow-[0_6px_30px_-20px_rgba(0,0,0,0.35)]">
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
              <textarea
                  className="h-auto w-full resize-none rounded-xl border border-black/15 bg-white/55 p-3 text-sm outline-none focus:border-black/30"
                  value={namesText}
                  onChange={(e) => setNamesText(e.target.value)}
                  placeholder="Имена, по одному на строку"
              />

                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => loadPreset("beginners")}
                                        disabled={!!loadingPreset}
                                        className="rounded-xl bg-transparent px-4 py-3 text-sm font-medium border border-black/25 text-black/80 hover:bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingPreset === "beginners" ? "Loading..." : "Beginners"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => loadPreset("open")}
                                        disabled={!!loadingPreset}
                                        className="rounded-xl bg-transparent px-4 py-3 text-sm font-medium border border-black/25 text-black/80 hover:bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingPreset === "open" ? "Loading..." : "Open styles"}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={regenerate}
                                    className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-[#f5f2ec] hover:bg-black/90 border border-black/70"
                                >
                                    Сгенерировать (рандом)
                                </button>
                                <button
                                    type="button"
                                    onClick={regenerateWithoutShuffle}
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

                                <button
                                    type="button"
                                    onClick={clearSaved}
                                    className="rounded-xl bg-transparent px-4 py-3 text-sm font-medium border border-black/25 text-black/80 hover:bg-white/50"
                                    title="Удалит сохранённую сетку из localStorage"
                                >
                                    Очистить
                                </button>

                                {error ? (
                                    <div className="text-xs text-red-600 border border-red-600/20 bg-red-500/5 rounded-xl px-3 py-2">
                                        {error}
                                    </div>
                                ) : null}

                                {players.length ? (
                                    <div className="rounded-xl border border-black/10 bg-white/40 p-3">
                                        <div className="text-xs font-semibold text-black/70 mb-2">
                                            Участники (удаление)
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {players.map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => deleteParticipant(p)}
                                                    className="rounded-lg border border-black/15 bg-white/70 px-2 py-1 text-xs hover:bg-white"
                                                    title="Удалить"
                                                >
                                                    {p} <span className="text-black/50">✕</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
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
                                                                    onDelete={p ? () => deleteParticipant(p) : undefined}
                                                                />
                                                            ))}
                                                        </div>

                                                        <div className="mt-3 text-xs">
                                                            <span className="text-black/55">Победитель: </span>
                                                            {m.winner ? (
                                                                <span className="text-black font-medium">{m.winner}</span>
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
