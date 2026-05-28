/**
 * V2 Dashboard chart theme — single source of truth for chart chrome.
 *
 * Every chart in the V2 dashboard MUST import its prop defaults from here.
 * No inline styles, no local overrides. If a chart needs a token that does
 * not exist, propose it here and update this file — never override locally.
 *
 * Tokens resolve to CSS variables so the dashboard stays in lockstep with the
 * design system. Hue reserved for categories lives in visualTokens.ts (not here).
 */

// -----------------------------------------------------------------------------
// Tokens — chrome (axis, reference) + value-channel ramps (series, tone).
// -----------------------------------------------------------------------------
export const chartTokens = {
    /** Axis stroke — barely visible; structure without ink. */
    axis: "hsl(var(--muted-foreground) / 0.45)",
    /** Axis tick text. */
    axisLabel: "hsl(var(--muted-foreground))",
    /** Reference / qualitative-band lines that replace gridlines. */
    reference: "hsl(var(--muted-foreground) / 0.25)",

    /**
     * Series chrome — Bertin's **Value** channel used to differentiate metrics
     * within a SINGLE multi-line chart. Not category. Category hues are in
     * visualTokens.ts and never appear here.
     *
     * Use sparingly: prefer small multiples over stacking many series.
     */
    series: {
        primary: "hsl(var(--foreground))",            // headline metric
        secondary: "hsl(var(--foreground) / 0.55)",   // companion metric
        accent: "hsl(var(--primary))",                // one highlight only
        trend: "hsl(var(--primary) / 0.55)",          // derived / forecast
        /**
         * Print-safe neutrals — fixed hex values that read correctly on both
         * dark screens and white paper. CSS variables don't reliably translate
         * to printed SVG `stroke`/`fill`, so reports that must survive PDF
         * export reach for these instead of `primary`/`secondary`.
         */
        print: "#525252",       // medium grey — strong line/text
        printMuted: "#a3a3a3",  // soft grey — companion line
    },

    /**
     * Tone — Bertin's **Value** mapped to risk/urgency. The only legitimate
     * use of color shift outside category data. Consumed by the `tone` prop
     * on sparklines and severity badges. Mapping is dashboard-wide:
     *   neutral → ok → warn → alert
     */
    tone: {
        neutral: "hsl(var(--foreground))",
        ok: "hsl(142 71% 45%)",
        warn: "hsl(38 92% 50%)",
        alert: "hsl(var(--destructive))",
    },
} as const

// -----------------------------------------------------------------------------
// Spreadable Recharts default-prop objects.
// Pattern: <XAxis {...axisDefaults} />, <Line {...lineDefaults} />, …
// -----------------------------------------------------------------------------

export const axisDefaults = {
    stroke: chartTokens.axis,
    strokeWidth: 1,
    tick: { fill: chartTokens.axisLabel, fontSize: 11 },
    tickLine: false,
    axisLine: { stroke: chartTokens.axis, strokeWidth: 1 },
} as const

export const lineDefaults = {
    type: "monotone" as const,
    strokeWidth: 1.5,
    dot: false,
    activeDot: { r: 3, strokeWidth: 0 },
    isAnimationActive: false,
} as const

export const barDefaults = {
    isAnimationActive: false,
    radius: 0,
} as const

export const tooltipDefaults = {
    cursor: { stroke: chartTokens.reference, strokeWidth: 1 },
    contentStyle: {
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: 4,
        boxShadow: "none",
        fontSize: 11,
        fontVariantNumeric: "tabular-nums" as const,
        padding: "6px 8px",
    },
    labelStyle: { color: chartTokens.axisLabel, marginBottom: 2 },
    itemStyle: { color: "hsl(var(--foreground))", padding: 0 },
} as const

export const referenceLineDefaults = {
    stroke: chartTokens.reference,
    strokeWidth: 1,
    strokeDasharray: "2 3",
} as const

export const chartMargin = { top: 6, right: 12, bottom: 6, left: 0 } as const

// -----------------------------------------------------------------------------
// Convention guard — what may NEVER appear in a V2 dashboard chart.
// Useful as a reference in PR review; the rules are enforced by code review,
// not by the runtime.
// -----------------------------------------------------------------------------
export const tufteForbidden = {
    CartesianGrid: "Use a ReferenceLine at the qualitative band instead.",
    Legend: "Direct-label series at the line terminus (LabelList).",
    PieChart: "Use a bullet graph or stacked bar.",
    RadialBar: "Use a bar or bullet graph.",
    decorativeShadow: "Flat tooltip; never boxShadow.",
    fatStrokes: "Lines stay at 1.5px; bars stay at radius 0.",
    decorativeAnimation: "isAnimationActive must be false on every series.",
} as const
