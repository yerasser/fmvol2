export default function Background() {
    return (
        <>
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.22] blur-[0.2px]"
                viewBox="0 0 1000 1600"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path
                    d="M120 50 C 60 180, 80 420, 140 610
             C 200 820, 160 980, 95 1160
             C 40 1350, 75 1500, 170 1580"
                    fill="none"
                    stroke="#0b0b0b"
                    strokeWidth="140"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                />
                <path
                    d="M860 140 C 940 300, 900 520, 820 690
             C 740 860, 780 1040, 900 1220
             C 1020 1400, 980 1520, 860 1580"
                    fill="none"
                    stroke="#0b0b0b"
                    strokeWidth="110"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                />
                <path
                    d="M520 0 C 470 120, 560 240, 500 360"
                    fill="none"
                    stroke="#0b0b0b"
                    strokeWidth="90"
                    strokeLinecap="round"
                    opacity="0.65"
                />
            </svg>
        </>
    )
}