import Papa from "papaparse"

export type ParsedQuestionRow = {
    stem: string
    alternatives: Record<string, string>
    correctAnswer: string | null
    subjectName: string | null
    contentName: string | null
    source: string | null
    year: number | null
    commentary: string | null
}

export type ParseResult = {
    valid: ParsedQuestionRow[]
    errors: { line: number; message: string }[]
}

export const MAX_ROWS = 500

const VALID_ANSWERS = new Set(["A", "B", "C", "D", "E"])

function normalizeKey(key: string): string {
    return key.trim().toLowerCase().replace(/[\s_-]+/g, "")
}

function normalizeName(value: string | null | undefined): string {
    if (!value) return ""
    return value
        .toString()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim()
}

function pick(row: Record<string, string>, ...keys: string[]): string {
    for (const key of keys) {
        const v = row[key]
        if (v !== undefined && v !== null && String(v).trim() !== "") {
            return String(v).trim()
        }
    }
    return ""
}

function validateRow(row: Record<string, string>, lineNumber: number): { ok: true; data: ParsedQuestionRow } | { ok: false; message: string } {
    const stem = pick(row, "stem", "enunciado")
    if (!stem) return { ok: false, message: `Linha ${lineNumber}: enunciado (stem) ausente` }

    const altA = pick(row, "alta", "alternativaa", "a")
    const altB = pick(row, "altb", "alternativab", "b")
    const altC = pick(row, "altc", "alternativac", "c")
    const altD = pick(row, "altd", "alternativad", "d")
    const altE = pick(row, "alte", "alternativae", "e")

    const filledCount = [altA, altB, altC, altD, altE].filter((x) => x).length
    if (filledCount < 3) {
        return { ok: false, message: `Linha ${lineNumber}: pelo menos 3 alternativas (A, B, C) são obrigatórias` }
    }
    if (!altA || !altB || !altC) {
        return { ok: false, message: `Linha ${lineNumber}: alternativas A, B e C são obrigatórias` }
    }

    const alternatives: Record<string, string> = {
        A: altA,
        B: altB,
        C: altC,
        D: altD || "",
        E: altE || "",
    }

    const correctRaw = pick(row, "correct", "correta", "respostacorreta", "gabarito")
    let correctAnswer: string | null = null
    if (correctRaw) {
        const upper = correctRaw.toUpperCase()
        if (!VALID_ANSWERS.has(upper)) {
            return { ok: false, message: `Linha ${lineNumber}: resposta correta deve ser A, B, C, D ou E (recebido: "${correctRaw}")` }
        }
        if (!alternatives[upper]) {
            return { ok: false, message: `Linha ${lineNumber}: alternativa ${upper} marcada como correta mas está vazia` }
        }
        correctAnswer = upper
    }

    const yearRaw = pick(row, "year", "ano")
    let year: number | null = null
    if (yearRaw) {
        const parsed = parseInt(yearRaw, 10)
        if (isNaN(parsed) || parsed < 1900 || parsed > 2100) {
            return { ok: false, message: `Linha ${lineNumber}: ano inválido (${yearRaw})` }
        }
        year = parsed
    }

    const subjectName = pick(row, "subject", "materia", "disciplina") || null
    const contentName = pick(row, "content", "conteudo", "topico") || null
    const source = pick(row, "source", "fonte", "origem") || null
    const commentary = pick(row, "commentary", "comentario", "comentário") || null

    return {
        ok: true,
        data: {
            stem,
            alternatives,
            correctAnswer,
            subjectName,
            contentName,
            source,
            year,
            commentary,
        },
    }
}

export function parseCsv(text: string): ParseResult {
    const result = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        delimiter: ";",
        transformHeader: (h) => normalizeKey(h),
    })

    const errors: { line: number; message: string }[] = []
    const valid: ParsedQuestionRow[] = []

    if (result.errors.length > 0) {
        for (const err of result.errors) {
            errors.push({ line: (err.row ?? 0) + 2, message: `Erro de parsing: ${err.message}` })
        }
    }

    const rows = result.data
    if (rows.length > MAX_ROWS) {
        errors.push({ line: 0, message: `Limite de ${MAX_ROWS} questões por arquivo excedido (${rows.length})` })
        return { valid: [], errors }
    }

    rows.forEach((row, idx) => {
        const lineNumber = idx + 2
        const v = validateRow(row, lineNumber)
        if (v.ok) {
            valid.push(v.data)
        } else {
            errors.push({ line: lineNumber, message: v.message })
        }
    })

    return { valid, errors }
}

export function parseJson(text: string): ParseResult {
    let parsed: unknown
    try {
        parsed = JSON.parse(text)
    } catch (e) {
        return { valid: [], errors: [{ line: 0, message: `JSON inválido: ${e instanceof Error ? e.message : String(e)}` }] }
    }

    if (!Array.isArray(parsed)) {
        return { valid: [], errors: [{ line: 0, message: "JSON deve ser um array de questões" }] }
    }

    if (parsed.length > MAX_ROWS) {
        return { valid: [], errors: [{ line: 0, message: `Limite de ${MAX_ROWS} questões por arquivo excedido (${parsed.length})` }] }
    }

    const errors: { line: number; message: string }[] = []
    const valid: ParsedQuestionRow[] = []

    parsed.forEach((item, idx) => {
        const lineNumber = idx + 1
        if (typeof item !== "object" || item === null) {
            errors.push({ line: lineNumber, message: `Item ${lineNumber}: deve ser um objeto` })
            return
        }

        const obj = item as Record<string, unknown>
        const flat: Record<string, string> = {}

        for (const [k, v] of Object.entries(obj)) {
            if (k === "alternatives" && typeof v === "object" && v !== null) {
                const alts = v as Record<string, unknown>
                if (alts.A !== undefined) flat.alta = String(alts.A)
                if (alts.B !== undefined) flat.altb = String(alts.B)
                if (alts.C !== undefined) flat.altc = String(alts.C)
                if (alts.D !== undefined) flat.altd = String(alts.D)
                if (alts.E !== undefined) flat.alte = String(alts.E)
            } else if (v !== null && v !== undefined) {
                flat[normalizeKey(k)] = String(v)
            }
        }

        const r = validateRow(flat, lineNumber)
        if (r.ok) valid.push(r.data)
        else errors.push({ line: lineNumber, message: r.message })
    })

    return { valid, errors }
}

export function matchSubjectsAndContents(
    rows: ParsedQuestionRow[],
    subjects: { id: string; name: string }[],
    contents: { id: string; name: string; subjectId: string }[],
): { row: ParsedQuestionRow; subjectId: string | null; contentId: string | null }[] {
    const subjectByName = new Map<string, string>()
    for (const s of subjects) subjectByName.set(normalizeName(s.name), s.id)

    const contentByKey = new Map<string, string>()
    for (const c of contents) {
        contentByKey.set(`${c.subjectId}|${normalizeName(c.name)}`, c.id)
    }

    return rows.map((row) => {
        const subjectId = row.subjectName ? subjectByName.get(normalizeName(row.subjectName)) ?? null : null
        const contentId =
            subjectId && row.contentName
                ? contentByKey.get(`${subjectId}|${normalizeName(row.contentName)}`) ?? null
                : null
        return { row, subjectId, contentId }
    })
}
