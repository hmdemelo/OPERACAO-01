'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export interface Slice {
    id: string
    label: string
    color: string
    done: number
    total: number
    href?: string
}

interface Props {
    slices: Slice[]
    radius?: number
}

const GAP = 0.028
const ALMOST_DONE_THRESHOLD = 0.8

function polar(cx: number, cy: number, r: number, angle: number) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

function sectorPath(cx: number, cy: number, r: number, start: number, end: number) {
    if (r <= 0) return ""
    const s = polar(cx, cy, r, start)
    const e = polar(cx, cy, r, end)
    const large = end - start > Math.PI ? 1 : 0
    return `M ${cx} ${cy} L ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)} Z`
}

function hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
}

export function PieChart({ slices, radius = 190 }: Props) {
    const router = useRouter()
    const [hover, setHover] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const t = requestAnimationFrame(() => setMounted(true))
        return () => cancelAnimationFrame(t)
    }, [])

    const n = slices.length
    if (n === 0) return null

    const LABEL_PAD = 130
    const W = (radius + LABEL_PAD) * 2
    const H = (radius + LABEL_PAD) * 2
    const cx = W / 2
    const cy = H / 2
    const rOuter = radius

    const step = (2 * Math.PI) / n
    const halfGap = n > 1 ? GAP / 2 : 0

    return (
        <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            className="max-w-full h-auto"
            style={{ overflow: "visible" }}
        >
            <defs>
                {slices.map((slice) => (
                    <radialGradient key={slice.id} id={`grad-${slice.id}`} cx="30%" cy="30%" r="80%">
                        <stop offset="0%" stopColor={slice.color} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={slice.color} stopOpacity={0.7} />
                    </radialGradient>
                ))}
                <style>{`
                    @keyframes pie-slice-in {
                        from { transform: scale(0.4); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    @keyframes pie-pulse {
                        0%, 100% { opacity: 0.55; }
                        50% { opacity: 1; }
                    }
                `}</style>
            </defs>

            {/* ── Camada 1: base de todas as fatias ── */}
            <g
                style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    transformBox: "fill-box" as never,
                    animation: mounted ? "pie-slice-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both" : undefined,
                    opacity: mounted ? 1 : 0,
                }}
            >
                {slices.map((slice, i) => {
                    const start = -Math.PI / 2 + i * step + halfGap
                    const end = start + step - 2 * halfGap
                    return (
                        <path
                            key={`base-${slice.id}`}
                            d={sectorPath(cx, cy, rOuter, start, end)}
                            fill={hexToRgba(slice.color, 0.18)}
                            stroke="hsl(var(--background))"
                            strokeWidth={2.5}
                        />
                    )
                })}
            </g>

            {/* ── Camada 2: preenchimento de progresso radial ── */}
            {slices.map((slice, i) => {
                const start = -Math.PI / 2 + i * step + halfGap
                const end = start + step - 2 * halfGap
                const pct = slice.total === 0 ? 0 : slice.done / slice.total
                const rFill = rOuter * Math.sqrt(pct)
                if (rFill <= 0) return null
                const delay = 0.4 + i * 0.05
                return (
                    <path
                        key={`fill-${slice.id}`}
                        d={sectorPath(cx, cy, rFill, start, end)}
                        fill={`url(#grad-${slice.id})`}
                        style={{
                            pointerEvents: "none",
                            transformOrigin: `${cx}px ${cy}px`,
                            transformBox: "fill-box" as never,
                            animation: mounted
                                ? `pie-slice-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both`
                                : undefined,
                            opacity: mounted ? 1 : 0,
                        }}
                    />
                )
            })}

            {/* ── Camada 3: % texto — sempre acima do preenchimento ── */}
            {slices.map((slice, i) => {
                const start = -Math.PI / 2 + i * step + halfGap
                const end = start + step - 2 * halfGap
                const mid = (start + end) / 2
                const pct = slice.total === 0 ? 0 : slice.done / slice.total
                const labelR = rOuter * 0.58
                const pos = polar(cx, cy, labelR, mid)
                const isComplete = pct >= 1 && slice.total > 0

                return (
                    <text
                        key={`pct-${slice.id}`}
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={step > 1.2 ? 15 : 12}
                        fontWeight={800}
                        fill={slice.color}
                        style={{
                            paintOrder: "stroke",
                            stroke: "hsl(var(--background))",
                            strokeWidth: 4,
                            strokeLinejoin: "round",
                            opacity: mounted ? 1 : 0,
                            transition: "opacity 0.4s ease 0.8s",
                        }}
                        className="pointer-events-none select-none"
                    >
                        {isComplete ? "✓ 100%" : `${Math.round(pct * 100)}%`}
                    </text>
                )
            })}

            {/* ── Camada 4: hover + labels externos ── */}
            {slices.map((slice, i) => {
                const start = -Math.PI / 2 + i * step + halfGap
                const end = start + step - 2 * halfGap
                const mid = (start + end) / 2
                const isHover = hover === slice.id
                const clickable = Boolean(slice.href)
                const pct = slice.total === 0 ? 0 : slice.done / slice.total
                const isComplete = pct >= 1 && slice.total > 0
                const isAlmostDone = !isComplete && pct >= ALMOST_DONE_THRESHOLD

                const connStart = polar(cx, cy, rOuter + 8, mid)
                const connKnee = polar(cx, cy, rOuter + 26, mid)
                const isRight = connKnee.x >= cx
                const lineEndX = isRight ? connKnee.x + 20 : connKnee.x - 20
                const textX = isRight ? lineEndX + 6 : lineEndX - 6
                const textAnchor = isRight ? "start" : "end"

                return (
                    <g
                        key={`ui-${slice.id}`}
                        onMouseEnter={() => setHover(slice.id)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => clickable && router.push(slice.href!)}
                        style={{ cursor: clickable ? "pointer" : "default" }}
                    >
                        {/* hit area + hover (+ borda especial p/ 100%) */}
                        <path
                            d={sectorPath(cx, cy, rOuter, start, end)}
                            fill={isHover ? hexToRgba(slice.color, 0.12) : "transparent"}
                            stroke={isComplete ? slice.color : isHover ? slice.color : "transparent"}
                            strokeWidth={isComplete ? 2.5 : 2}
                            style={{
                                filter: isHover
                                    ? `drop-shadow(0 0 10px ${hexToRgba(slice.color, 0.55)})`
                                    : isComplete
                                        ? `drop-shadow(0 0 6px ${hexToRgba(slice.color, 0.45)})`
                                        : undefined,
                                transition: "all 0.15s ease",
                            }}
                        />

                        {/* ring pulsante para fatias 80%+ (ainda não 100%) */}
                        {isAlmostDone && (
                            <path
                                d={sectorPath(cx, cy, rOuter + 3, start, end)}
                                fill="none"
                                stroke={slice.color}
                                strokeWidth={1.5}
                                strokeDasharray="4 3"
                                style={{
                                    animation: "pie-pulse 1.8s ease-in-out infinite",
                                    pointerEvents: "none",
                                }}
                            />
                        )}

                        {/* conector L */}
                        <polyline
                            points={`${connStart.x.toFixed(1)},${connStart.y.toFixed(1)} ${connKnee.x.toFixed(1)},${connKnee.y.toFixed(1)} ${lineEndX.toFixed(1)},${connKnee.y.toFixed(1)}`}
                            fill="none"
                            stroke={slice.color}
                            strokeWidth={1.3}
                            opacity={isHover ? 1 : 0.6}
                            className="pointer-events-none"
                        />

                        {/* nome */}
                        <text
                            x={textX}
                            y={connKnee.y - 6}
                            textAnchor={textAnchor}
                            dominantBaseline="auto"
                            fontSize={11}
                            fontWeight={700}
                            fill={isHover ? slice.color : hexToRgba(slice.color, 0.9)}
                            className="pointer-events-none select-none"
                        >
                            {isComplete ? `✓ ${slice.label}` : slice.label}
                        </text>

                        {/* contagem */}
                        <text
                            x={textX}
                            y={connKnee.y + 8}
                            textAnchor={textAnchor}
                            dominantBaseline="auto"
                            fontSize={10}
                            fontWeight={500}
                            fill={hexToRgba(slice.color, 0.6)}
                            className="pointer-events-none select-none"
                        >
                            {slice.done}/{slice.total} · {Math.round(pct * 100)}%
                        </text>
                    </g>
                )
            })}

            {/* anel externo decorativo */}
            <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="hsl(var(--border))" strokeWidth={1} opacity={0.4} />
        </svg>
    )
}
