import React, { useMemo, useRef, useState, useEffect } from "react";

export default function VinylRecord() {
    const items = useMemo(
        () => ["Popping", "Boogaloo", "Lines", "Animation", "Waving", "Concepts", "Bay area", "Footwork/ground"],
        []
    );

    const N = items.length;
    const slice = 360 / N;

    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);

    const gRef = useRef(null);
    const rafRef = useRef(null);
    const lastTargetRef = useRef(0);
    const rotationRef = useRef(0);


    const [liveAngle, setLiveAngle] = useState(0);
    const [durationMs, setDurationMs] = useState(4400);

    const cx = 160;
    const cy = 160;
    const R = 150;
    const labelR = 38;
    const holeR = 6;


    const polarToCartesian = (centerX, centerY, radius, angleDeg) => {
        const a = ((angleDeg - 90) * Math.PI) / 180;
        return { x: centerX + radius * Math.cos(a), y: centerY + radius * Math.sin(a) };
    };

    const grooveRings = useMemo(() => {
        const rings = [];
        for (let r = labelR + 18; r <= R - 8; r += 2) {
            const t = (r - (labelR + 18)) / (R - 8 - (labelR + 18));
            const base = 0.03 + 0.05 * (1 - t);
            const wobble = 0.015 * Math.sin(r * 0.65) + 0.01 * Math.cos(r * 0.18);
            rings.push({ r, o: Math.max(0.01, Math.min(0.1, base + wobble)) });
        }
        return rings;
    }, []);

    const getAngleFromMatrix = (el) => {
        const t = window.getComputedStyle(el).transform;
        if (!t || t === "none") return 0;

        const m = t.match(/matrix\(([^)]+)\)/);
        if (!m) return 0;

        const [a, b] = m[1].split(",").map((x) => parseFloat(x.trim()));
        const rad = Math.atan2(b, a);
        let deg = (rad * 180) / Math.PI;
        deg = (deg + 360) % 360;
        return deg;
    };

    const idxUnderPointerLive = (discAngleDeg) => {
        // для подсветки можно оставить EPS чтобы меньше мигало
        const pointerAngle = (360 - (discAngleDeg % 360) + 360) % 360;
        const shifted = (pointerAngle + 0.6) % 360;
        return Math.floor(shifted / slice);
    };


    const startTracking = () => {
        if (rafRef.current) return;

        const tick = () => {
            if (gRef.current) {
                const deg = getAngleFromMatrix(gRef.current);
                setLiveAngle(deg);
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
    };

    const stopTracking = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    };

    useEffect(() => () => stopTracking(), []);

    const spin = () => {
        if (spinning) return;
        setSpinning(true);

        setDurationMs(3600 + Math.random() * 2200);

        const winnerIndex = Math.floor(Math.random() * N);

        const margin = slice * 0.18;
        const offsetInSlice = margin + Math.random() * (slice - 2 * margin);
        const pointerTarget = winnerIndex * slice + offsetInSlice;

        const extraTurns = 6 + Math.floor(Math.random() * 5);
        const jitter = (Math.random() - 0.5) * 0.8;

        const target = 360 * extraTurns - pointerTarget + jitter;

        const base = rotationRef.current;
        const newRotation = base + target + 720;

        rotationRef.current = newRotation;
        lastTargetRef.current = newRotation; // можно оставить, но финал не по нему
        setRotation(newRotation);

        startTracking();
    };



    const onTransitionEnd = (e) => {
        if (e.target !== gRef.current) return;

        stopTracking();

        setSpinning(false);
    };


    const prizeTextPos = (i) => {
        const mid = i * slice + slice / 2;
        const p = polarToCartesian(cx, cy, labelR + 34, mid);
        return { ...p, mid };
    };

    const describeRingSlice = (cx0, cy0, rOuter, rInner, startDeg, endDeg) => {
        const toXY = (r, aDeg) => {
            const a = ((aDeg - 90) * Math.PI) / 180;
            return { x: cx0 + r * Math.cos(a), y: cy0 + r * Math.sin(a) };
        };

        const norm = (d) => ((d % 360) + 360) % 360;
        const s = norm(startDeg);
        const e = norm(endDeg);
        const sweep = (e - s + 360) % 360;
        const largeArc = sweep > 180 ? 1 : 0;

        const p1 = toXY(rOuter, s);
        const p2 = toXY(rOuter, e);
        const p3 = toXY(rInner, e);
        const p4 = toXY(rInner, s);

        return [
            `M ${p1.x} ${p1.y}`,
            `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
            `L ${p3.x} ${p3.y}`,
            `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
            "Z",
        ].join(" ");
    };

    const liveIdx = idxUnderPointerLive(liveAngle);
    const segStart = liveIdx * slice;
    const segEnd = segStart + slice;

    return (
        <div className="flex justify-center w-full px-10">
            <div className="relative w-full aspect-square">
                <div
                    style={{
                        position: "absolute",
                        top: 2,
                        left: "50%",
                        transform: "translateX(50%)",
                        rotate: "180deg",
                        width: 0,
                        height: 0,
                        borderLeft: "3vw solid transparent",
                        borderRight: "3vw solid transparent",
                        borderBottom: "4vw solid rgba(220, 215, 204)",
                        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.35))",
                        zIndex: 3,
                    }}
                />

                <svg
                    className="w-full h-full"
                    viewBox="0 0 320 320"
                    preserveAspectRatio="xMidYMid meet"
                    onClick={spin}
                >
                    <defs>
                        <radialGradient id="vinylBase" cx="40%" cy="35%" r="75%">
                            <stop offset="0%" stopColor="#2a2f3a" />
                            <stop offset="45%" stopColor="#121723" />
                            <stop offset="75%" stopColor="#070a10" />
                            <stop offset="100%" stopColor="#04060b" />
                        </radialGradient>

                        <radialGradient id="edgeSpec" cx="55%" cy="45%" r="70%">
                            <stop offset="60%" stopColor="rgba(255,255,255,0)" />
                            <stop offset="80%" stopColor="rgba(255,255,255,0.10)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </radialGradient>

                        <linearGradient id="diagHighlight" x1="18%" y1="20%" x2="82%" y2="48%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                            <stop offset="32%" stopColor="rgba(255,255,255,0.06)" />
                            <stop offset="48%" stopColor="rgba(255,255,255,0.22)" />
                            <stop offset="60%" stopColor="rgba(255,255,255,0.10)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>

                        <filter id="dust" x="-20%" y="-20%" width="140%" height="140%">
                            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
                            <feColorMatrix
                                type="matrix"
                                values="
                  0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0.18 0"
                            />
                        </filter>

                        <filter id="discShadow" x="-30%" y="-30%" width="160%" height="160%">
                            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="rgba(0,0,0,0.45)" />
                        </filter>

                        <radialGradient id="labelGrad" cx="40%" cy="35%" r="80%">
                            <stop offset="0%" stopColor="#f2f0ea" />
                            <stop offset="65%" stopColor="#d8d2c6" />
                            <stop offset="100%" stopColor="#b9b1a3" />
                        </radialGradient>

                        <clipPath id="discClip">
                            <circle cx={cx} cy={cy} r={R} />
                        </clipPath>
                    </defs>

                    <g
                        ref={gRef}
                        onTransitionEnd={onTransitionEnd}
                        style={{
                            transformOrigin: `${cx}px ${cy}px`,
                            transform: `rotate(${rotation}deg)`,
                            transition: spinning
                                ? `transform ${durationMs}ms cubic-bezier(0.12, 0.9, 0.2, 1)`
                                : "none",
                        }}
                    >
                        <circle cx={cx} cy={cy} r={R} fill="transparent" filter="url(#discShadow)" />

                        <g clipPath="url(#discClip)">
                            <circle cx={cx} cy={cy} r={R} fill="url(#vinylBase)" />

                            {/* подсветка текущего ближайшего сектора */}
                            <path d={describeRingSlice(cx, cy, R - 6, labelR + 14, segStart, segEnd)} fill="rgba(255,255,255,0.08)" />
                            <path
                                d={describeRingSlice(cx, cy, R - 6, labelR + 14, segStart, segEnd)}
                                fill="none"
                                stroke="rgba(255,255,255,0.14)"
                                strokeWidth="1"
                            />

                            {grooveRings.map((gr) => (
                                <circle
                                    key={gr.r}
                                    cx={cx}
                                    cy={cy}
                                    r={gr.r}
                                    fill="none"
                                    stroke={`rgba(255,255,255,${gr.o})`}
                                    strokeWidth="1"
                                />
                            ))}

                            {grooveRings.map((gr) => (
                                <circle key={`d${gr.r}`} cx={cx} cy={cy} r={gr.r + 0.7} fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1" />
                            ))}

                            <rect x="0" y="0" width="320" height="320" filter="url(#dust)" opacity="0.22" />
                            <rect x="0" y="0" width="320" height="320" fill="url(#diagHighlight)" />
                            <circle cx={cx} cy={cy} r={R} fill="url(#edgeSpec)" />
                        </g>

                        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="4" />

                        <circle cx={cx} cy={cy} r={labelR} fill="url(#labelGrad)" stroke="rgba(0,0,0,0.35)" strokeWidth="2" />
                        <circle cx={cx} cy={cy} r={labelR - 10} fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="1" />

                        {items.map((t, i) => {
                            const p = prizeTextPos(i);
                            const active = i === liveIdx;

                            return (
                                <text
                                    key={t}
                                    x={p.x}
                                    y={p.y - 40}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="10"
                                    fill={active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.22)"}
                                    transform={`rotate(${p.mid} ${p.x} ${p.y})`}
                                    style={{
                                        letterSpacing: "0.3px",
                                        filter: active ? "drop-shadow(0 0 5px rgba(255,255,255,0.95))" : "none",
                                    }}
                                >
                                    {t}
                                </text>
                            );
                        })}

                        <circle cx={cx} cy={cy} r={holeR} fill="rgba(20,20,20,0.9)" />
                        <circle cx={cx} cy={cy} r={holeR + 1.5} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                    </g>
                </svg>
            </div>
        </div>
    );
}
