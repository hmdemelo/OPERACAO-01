export interface BranchContent {
    name: string
    /** Nomes dos tópicos concluídos dentro do conteúdo. */
    topics: string[]
}

export interface BranchSlice {
    id: string
    subjectV2Id: string
    label: string
    color: string
    done: number
    total: number
    /** Conteúdos com ao menos um tópico concluído. */
    contents: BranchContent[]
}

interface Props {
    slices: BranchSlice[]
    radius?: number
}

const GAP = 0.028
const COLUMN_W = 270
const BLOCK_GAP = 16

// Ritmo vertical (px) usado tanto na medição quanto no desenho.
const SUBJECT_H = 15
const COUNT_H = 13
const HEADER_PAD = 9
const CONTENT_H = 15
const TOPIC_H = 14
const CONTENT_PAD = 5
const BLOCK_PAD = 6

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

function truncate(s: string, max: number) {
    return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s
}

function blockHeight(slice: BranchSlice) {
    let h = SUBJECT_H + COUNT_H + HEADER_PAD
    if (slice.contents.length === 0) {
        h += CONTENT_H // linha "nenhum tópico concluído"
    } else {
        for (const c of slice.contents) {
            h += CONTENT_H + c.topics.length * TOPIC_H + CONTENT_PAD
        }
    }
    return h + BLOCK_PAD
}

export function CycleBranchChart({ slices, radius = 150 }: Props) {
    const n = slices.length
    if (n === 0) return null

    const step = (2 * Math.PI) / n
    const halfGap = n > 1 ? GAP / 2 : 0

    // Geometria de cada fatia + a qual lado (coluna) pertence.
    const laid = slices.map((slice, i) => {
        const start = -Math.PI / 2 + i * step + halfGap
        const end = start + step - 2 * halfGap
        const mid = (start + end) / 2
        return { slice, start, end, mid, side: Math.cos(mid) >= 0 ? "right" as const : "left" as const, h: blockHeight(slice) }
    })

    const right = laid.filter(l => l.side === "right").sort((a, b) => a.mid - b.mid)
    const left = laid.filter(l => l.side === "left").sort((a, b) => a.mid - b.mid)

    const colTotal = (arr: typeof laid) =>
        arr.reduce((sum, l) => sum + l.h, 0) + Math.max(0, arr.length - 1) * BLOCK_GAP

    const rightTotal = colTotal(right)
    const leftTotal = colTotal(left)

    const W = radius * 2 + COLUMN_W * 2
    const cx = W / 2
    const H = Math.max(radius * 2 + 40, rightTotal, leftTotal) + 60
    const cy = H / 2

    // Coordenadas das colunas (spine = tronco vertical).
    const rightSpineX = cx + radius + 46
    const leftSpineX = cx - radius - 46

    // Atribui um topo a cada bloco, empilhando centralizado na vertical.
    function placed(arr: typeof laid, total: number) {
        let cursor = cy - total / 2
        return arr.map(l => {
            const top = cursor
            cursor += l.h + BLOCK_GAP
            return { ...l, top }
        })
    }

    const rightPlaced = placed(right, rightTotal)
    const leftPlaced = placed(left, leftTotal)

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
                    <radialGradient key={slice.id} id={`bgrad-${slice.id}`} cx="30%" cy="30%" r="80%">
                        <stop offset="0%" stopColor={slice.color} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={slice.color} stopOpacity={0.7} />
                    </radialGradient>
                ))}
            </defs>

            {/* ── Base das fatias ── */}
            {laid.map(({ slice, start, end }) => (
                <path
                    key={`base-${slice.id}`}
                    d={sectorPath(cx, cy, radius, start, end)}
                    fill={hexToRgba(slice.color, 0.18)}
                    stroke="hsl(var(--background))"
                    strokeWidth={2.5}
                />
            ))}

            {/* ── Preenchimento radial de progresso ── */}
            {laid.map(({ slice, start, end }) => {
                const pct = slice.total === 0 ? 0 : slice.done / slice.total
                const rFill = radius * Math.sqrt(pct)
                if (rFill <= 0) return null
                return (
                    <path
                        key={`fill-${slice.id}`}
                        d={sectorPath(cx, cy, rFill, start, end)}
                        fill={`url(#bgrad-${slice.id})`}
                    />
                )
            })}

            {/* ── % central por fatia ── */}
            {laid.map(({ slice, mid }) => {
                const pct = slice.total === 0 ? 0 : slice.done / slice.total
                const pos = polar(cx, cy, radius * 0.58, mid)
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
                        style={{ paintOrder: "stroke", stroke: "hsl(var(--background))", strokeWidth: 4, strokeLinejoin: "round" }}
                    >
                        {isComplete ? "✓ 100%" : `${Math.round(pct * 100)}%`}
                    </text>
                )
            })}

            <circle cx={cx} cy={cy} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={1} opacity={0.4} />

            {/* ── Ramificações por fatia ── */}
            {[...rightPlaced, ...leftPlaced].map((l) => {
                const isRight = l.side === "right"
                const spineX = isRight ? rightSpineX : leftSpineX
                const anchor = isRight ? "start" : "end"
                const dir = isRight ? 1 : -1
                const subjectX = spineX + 6 * dir
                const contentX = spineX + 12 * dir
                const topicX = spineX + 26 * dir
                const { slice } = l
                const pct = slice.total === 0 ? 0 : slice.done / slice.total

                // Tronco: borda da fatia → joelho → topo do bloco.
                const edge = polar(cx, cy, radius + 4, l.mid)
                const knee = polar(cx, cy, radius + 22, l.mid)
                const headerY = l.top + SUBJECT_H

                // Cursor vertical interno ao bloco.
                let y = l.top
                y += SUBJECT_H
                const subjectY = y
                y += COUNT_H
                const countY = y
                y += HEADER_PAD

                const contentRows: { y: number; topicYs: number[]; content: BranchContent }[] = []
                if (slice.contents.length > 0) {
                    for (const c of slice.contents) {
                        y += CONTENT_H
                        const cy2 = y
                        const topicYs: number[] = []
                        for (let t = 0; t < c.topics.length; t++) {
                            y += TOPIC_H
                            topicYs.push(y)
                        }
                        y += CONTENT_PAD
                        contentRows.push({ y: cy2, topicYs, content: c })
                    }
                }
                const spineBottom = y

                return (
                    <g key={`branch-${slice.id}`}>
                        {/* tronco: borda → joelho radial → horizontal até spine → vertical até bloco */}
                        <polyline
                            points={`${edge.x.toFixed(1)},${edge.y.toFixed(1)} ${knee.x.toFixed(1)},${knee.y.toFixed(1)} ${spineX},${knee.y.toFixed(1)} ${spineX},${headerY.toFixed(1)}`}
                            fill="none"
                            stroke={slice.color}
                            strokeWidth={1.4}
                            opacity={0.7}
                        />
                        {/* spine vertical */}
                        {contentRows.length > 0 && (
                            <line
                                x1={spineX}
                                y1={headerY}
                                x2={spineX}
                                y2={spineBottom}
                                stroke={hexToRgba(slice.color, 0.45)}
                                strokeWidth={1.2}
                            />
                        )}

                        {/* nome da disciplina */}
                        <text x={subjectX} y={subjectY} textAnchor={anchor} dominantBaseline="auto" fontSize={13} fontWeight={800} fill={slice.color}>
                            {pct >= 1 && slice.total > 0 ? `✓ ${truncate(slice.label, 30)}` : truncate(slice.label, 30)}
                        </text>
                        {/* contagem */}
                        <text x={subjectX} y={countY} textAnchor={anchor} dominantBaseline="auto" fontSize={10} fontWeight={500} fill={hexToRgba(slice.color, 0.6)}>
                            {slice.done}/{slice.total} · {Math.round(pct * 100)}%
                        </text>

                        {slice.contents.length === 0 ? (
                            <text x={contentX} y={countY + CONTENT_H} textAnchor={anchor} dominantBaseline="auto" fontSize={10} fontStyle="italic" fill="hsl(var(--muted-foreground))">
                                Nenhum tópico concluído
                            </text>
                        ) : (
                            contentRows.map((row, ci) => (
                                <g key={`c-${slice.id}-${ci}`}>
                                    {/* galho do conteúdo */}
                                    <line x1={spineX} y1={row.y - 4} x2={contentX} y2={row.y - 4} stroke={hexToRgba(slice.color, 0.45)} strokeWidth={1.2} />
                                    <text x={contentX + 2 * dir} y={row.y} textAnchor={anchor} dominantBaseline="auto" fontSize={11} fontWeight={700} fill="hsl(var(--foreground))">
                                        {truncate(row.content.name, 32)}
                                    </text>
                                    {row.content.topics.map((tp, ti) => (
                                        <text key={`t-${slice.id}-${ci}-${ti}`} x={topicX} y={row.topicYs[ti]} textAnchor={anchor} dominantBaseline="auto" fontSize={10} fill="hsl(var(--muted-foreground))">
                                            {isRight ? "↳ " : "↲ "}{truncate(tp, 34)}
                                        </text>
                                    ))}
                                </g>
                            ))
                        )}
                    </g>
                )
            })}
        </svg>
    )
}
