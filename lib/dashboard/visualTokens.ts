/**
 * Categorical hue palette — the ONLY place where multiple hues are legitimate
 * within a single chart. Used for category data (e.g. subjects in the Fase 1
 * pizza), never for value/quantitative channels (those live in chartTheme.ts).
 *
 * Colors are fixed hex (not CSS variables) so they survive SVG export and
 * print correctly. Chosen to be distinguishable in both dark and light
 * contexts and ordered for sensible defaults.
 */
export const categoryPalette = [
    "#f97316", // 1 — laranja (brand)
    "#22c55e", // 2 — verde
    "#f59e0b", // 3 — âmbar
    "#3b82f6", // 4 — azul
    "#a855f7", // 5 — violeta
    "#ec4899", // 6 — rosa
    "#14b8a6", // 7 — teal
    "#eab308", // 8 — amarelo
    "#ef4444", // 9 — vermelho
    "#8b5cf6", // 10 — índigo
] as const

export type CategoryColor = typeof categoryPalette[number]

export function isCategoryColor(value: string): value is CategoryColor {
    return (categoryPalette as readonly string[]).includes(value)
}

/** Deterministic fallback when no preference exists yet. */
export function defaultColorForId(id: string): CategoryColor {
    let h = 0
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
    return categoryPalette[h % categoryPalette.length]
}
