import React, { useEffect, useMemo, useRef, useState } from "react";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function hash2(x, y) {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return s - Math.floor(s);
}

export default function VinylRecord() {
    const items = useMemo(
        () => ["Popping", "Boogaloo", "Lines", "Animation", "Waving", "Concepts", "Bay area", "Footwork\nGround"],
        []
    );

    const N = items.length;
    const slice = (Math.PI * 2) / N;

    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const logoRef = useRef(null);
    const logoReadyRef = useRef(false);

    useEffect(() => {
        const img = new Image();
        img.src = "/fm_logo.png";
        img.onload = () => {
            logoRef.current = img;
            logoReadyRef.current = true;
        };
    }, []);


    const [spinning, setSpinning] = useState(false);
    const [liveIdx, setLiveIdx] = useState(0);

    const rotationRef = useRef(0);
    const animRef = useRef({ start: 0, dur: 0, from: 0, to: 0, active: false });
    const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

    const dustRef = useRef(null); // { canvas, w, h, dpr }

    const lastWinnersRef = useRef([]); // latest first, max 3
    const lastWinnerPlannedRef = useRef(null);

    const idxUnderPointer = (discAngleRad) => {
        const a = ((-discAngleRad % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const shifted = (a + slice * 0.03) % (Math.PI * 2);
        return Math.floor(shifted / slice);
    };

    const stop = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        animRef.current.active = false;
    };

    const drawMultiline = (ctx, text, x, y, lineHeight) => {
        const lines = String(text).split("\n");
        const total = (lines.length - 1) * lineHeight;
        for (let j = 0; j < lines.length; j++) {
            ctx.fillText(lines[j], x, y + j * lineHeight - total / 2);
        }
    };

    const ringSlicePath = (ctx, rOuter, rInner, startRad, endRad) => {
        ctx.beginPath();
        ctx.arc(0, 0, rOuter, startRad, endRad);
        ctx.arc(0, 0, rInner, endRad, startRad, true);
        ctx.closePath();
    };

    const ensureDust = (pxSize, dpr) => {
        const wantW = Math.floor(pxSize * dpr);
        const wantH = Math.floor(pxSize * dpr);

        const cur = dustRef.current;
        if (cur && cur.w === wantW && cur.h === wantH && cur.dpr === dpr) return;

        const off = document.createElement("canvas");
        off.width = wantW;
        off.height = wantH;

        const octx = off.getContext("2d");
        octx.clearRect(0, 0, wantW, wantH);

        const img = octx.createImageData(wantW, wantH);
        const data = img.data;

        for (let y = 0; y < wantH; y++) {
            for (let x = 0; x < wantW; x++) {
                const n = hash2(x, y);
                const speck = n > 0.995 ? 1 : 0;
                const grain = (n - 0.5) * 0.06;
                const v = clamp(grain + speck * 0.55, 0, 0.8);
                const a = clamp(v * 255, 0, 255);

                const i = (y * wantW + x) * 4;
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
                data[i + 3] = a;
            }
        }
        octx.putImageData(img, 0, 0);

        dustRef.current = { canvas: off, w: wantW, h: wantH, dpr };
    };

    const draw = (ctx, angleRad) => {
        const { w, h, dpr } = sizeRef.current;
        const W = w / dpr;
        const H = h / dpr;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        const cx = W / 2;
        const cy = H / 2;

        const R = Math.min(W, H) * 0.46;
        const labelR = R * 0.25;
        const holeR = R * 0.04;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.shadowColor = "rgba(0,0,0,0.45)";
        ctx.shadowBlur = R * 0.08;
        ctx.shadowOffsetY = R * 0.04;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.0001)";
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angleRad);

        const base = ctx.createRadialGradient(-R * 0.1, -R * 0.15, R * 0.1, 0, 0, R * 0.75);
        base.addColorStop(0.0, "#2a2f3a");
        base.addColorStop(0.45, "#121723");
        base.addColorStop(0.75, "#070a10");
        base.addColorStop(1.0, "#04060b");

        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fillStyle = base;
        ctx.fill();

        const idx = idxUnderPointer(angleRad);
        const start = idx * slice - Math.PI / 2;
        const end = start + slice;

        const rOuter = R - R * 0.04;
        const rInner = labelR + R * 0.093;

        ringSlicePath(ctx, rOuter, rInner, start, end);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fill();

        ringSlicePath(ctx, rOuter, rInner, start, end);
        ctx.strokeStyle = "rgba(255,255,255,0.14)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.save();
        ctx.globalAlpha = 1;

        const r0 = labelR + R * 0.12;
        const r1 = R - R * 0.053;

        const step = Math.max(1.2, R * 0.013);
        for (let r = r0; r <= r1; r += step) {
            const t = (r - r0) / (r1 - r0);
            const baseO = 0.03 + 0.05 * (1 - t);
            const wobble = 0.015 * Math.sin(r * 0.65) + 0.01 * Math.cos(r * 0.18);
            const o = clamp(baseO + wobble, 0.01, 0.1);

            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255,255,255,${o})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, r + 0.7, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(0,0,0,0.10)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.rotate(-angleRad);
        const pxSize = Math.min(W, H);
        ensureDust(pxSize, dpr);
        const dust = dustRef.current?.canvas;
        if (dust) {
            ctx.globalAlpha = 0.22;
            ctx.drawImage(dust, -W / 2, -H / 2, W, H);
        }
        ctx.restore();

        ctx.save();
        const g = ctx.createLinearGradient(-R * 0.64, -R * 0.55, R * 0.64, -R * 0.12);
        g.addColorStop(0.0, "rgba(255,255,255,0)");
        g.addColorStop(0.32, "rgba(255,255,255,0.06)");
        g.addColorStop(0.48, "rgba(255,255,255,0.22)");
        g.addColorStop(0.60, "rgba(255,255,255,0.10)");
        g.addColorStop(1.0, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        const edge = ctx.createRadialGradient(R * 0.05, -R * 0.05, R * 0.1, 0, 0, R * 0.7);
        edge.addColorStop(0.60, "rgba(255,255,255,0)");
        edge.addColorStop(0.80, "rgba(255,255,255,0.10)");
        edge.addColorStop(1.0, "rgba(255,255,255,0)");
        ctx.fillStyle = edge;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,0,0,0.55)";
        ctx.lineWidth = 4;
        ctx.stroke();

        const label = ctx.createRadialGradient(-labelR * 0.2, -labelR * 0.3, labelR * 0.2, 0, 0, labelR);
        label.addColorStop(0, "#f2f0ea");
        label.addColorStop(0.65, "#d8d2c6");
        label.addColorStop(1, "#b9b1a3");

        ctx.beginPath();
        ctx.arc(0, 0, labelR, 0, Math.PI * 2);
        ctx.fillStyle = label;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, labelR - R * 0.067, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.20)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.save();
        const fontSize = Math.max(10, R * 0.07);
        ctx.font = `${fontSize}px Arimo`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let i = 0; i < N; i++) {
            const mid = i * slice + slice / 2;
            const rText = labelR + R * 0.23;
            const x = Math.cos(mid - Math.PI / 2) * rText;
            const y = Math.sin(mid - Math.PI / 2) * rText;

            const active = i === idx;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(mid);

            ctx.fillStyle = active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.22)";
            if (active) {
                ctx.shadowColor = "rgba(255,255,255,0.95)";
                ctx.shadowBlur = 6;
            } else {
                ctx.shadowBlur = 0;
            }

            const lineHeight = fontSize * 0.95;
            drawMultiline(ctx, items[i], 0, -R * 0.2, lineHeight);

            ctx.restore();
        }
        ctx.restore();

        ctx.beginPath();
        ctx.arc(0, 0, holeR, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(20,20,20,0.9)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, holeR + 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();

        ctx.save();
        ctx.translate(cx, cy);
        const pW = R * 0.1;
        const pH = R * 0.12;
        const inset = R * 0.06;
        const tipY = -R + inset;

        ctx.beginPath();
        ctx.moveTo(0, tipY);
        ctx.lineTo(-pW, tipY - pH);
        ctx.lineTo(pW, tipY - pH);
        ctx.closePath();

        ctx.fillStyle = "rgba(220,215,204,0.95)";
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();

        const newIdx = idxUnderPointer(angleRad);
        if (newIdx !== liveIdx) setLiveIdx(newIdx);
    };

    const tick = (now) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const a = animRef.current;

        if (!a.active) {
            draw(ctx, rotationRef.current);
            rafRef.current = requestAnimationFrame(tick);
            return;
        }

        const t = clamp((now - a.start) / a.dur, 0, 1);
        const k = easeOutCubic(t);
        const ang = a.from + (a.to - a.from) * k;

        rotationRef.current = ang;
        draw(ctx, ang);

        if (t < 1) {
            rafRef.current = requestAnimationFrame(tick);
        } else {
            a.active = false;
            setSpinning(false);

            rafRef.current = requestAnimationFrame(tick);
        }
    };

    const resize = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const parent = canvas.parentElement;
        const rect = parent.getBoundingClientRect();

        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        const size = Math.floor(Math.min(rect.width, rect.height));

        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        canvas.width = Math.floor(size * dpr);
        canvas.height = Math.floor(size * dpr);

        sizeRef.current = { w: canvas.width, h: canvas.height, dpr };

        const ctx = canvas.getContext("2d");
        draw(ctx, rotationRef.current);
    };

    useEffect(() => {
        resize();
        rafRef.current = requestAnimationFrame(tick);
        window.addEventListener("resize", resize);
        return () => {
            window.removeEventListener("resize", resize);
            stop();
        };
    }, []);

    const spin = () => {
        if (animRef.current.active) {
            console.log("[spin] blocked: animation still active");
            return;
        }

        setSpinning(true);

        const dur = 3600 + Math.random() * 2200;

        const blockedArr = lastWinnersRef.current.slice(0, 3);
        const blockedSet = new Set(blockedArr);

        let winnerIndex;
        let attempts = 0;

        if (N <= 3) {
            winnerIndex = Math.floor(Math.random() * N);
        } else {
            do {
                winnerIndex = Math.floor(Math.random() * N);
                attempts += 1;
                if (attempts > 200) break;
            } while (blockedSet.has(winnerIndex));
        }

        lastWinnersRef.current = [winnerIndex, ...lastWinnersRef.current].slice(0, 3);
        lastWinnerPlannedRef.current = winnerIndex;

        const twoPi = Math.PI * 2;

        const margin = slice * 0.18;
        const offsetInSlice = margin + Math.random() * (slice - 2 * margin);

        const shifted = (winnerIndex * slice + offsetInSlice) % twoPi;
        const a = (shifted - slice * 0.03 + twoPi) % twoPi;
        const desiredMod = (twoPi - a) % twoPi;

        const from = rotationRef.current;
        const fromMod = ((from % twoPi) + twoPi) % twoPi;

        let deltaMod = (desiredMod - fromMod + twoPi) % twoPi;

        const extraTurns = 6 + Math.floor(Math.random() * 5);
        const target = twoPi * extraTurns + deltaMod;

        const to = from + target;

        animRef.current = {
            start: performance.now(),
            dur,
            from,
            to,
            active: true,
        };
    };


    return (
        <div className="flex justify-center w-full px-3">
            <div className="relative w-full aspect-square">
                <canvas
                    ref={canvasRef}
                    onClick={spin}
                    className="w-full h-full cursor-pointer select-none"
                    style={{ touchAction: "manipulation" }}
                />
            </div>
        </div>
    );
}
