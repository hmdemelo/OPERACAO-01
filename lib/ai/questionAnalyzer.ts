import Anthropic from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { GoogleGenAI } from "@google/genai"
import { getSetting } from "@/lib/settings"

export type ExtractedQuestion = {
    stem: string
    alternatives: Record<string, string>
    subjectId: string | null
    contentId: string | null
    source: string | null
    year: number | null
}

export type EnrichedQuestion = {
    correctAnswer: string
    commentary: string
}

type SubjectRef = { id: string; name: string }
type ContentRef = { id: string; name: string; subjectId: string }

async function loadAISettings() {
    const [provider, model, apiKey] = await Promise.all([
        getSetting("ai_provider"),
        getSetting("ai_model"),
        getSetting("ai_api_key"),
    ])

    if (!apiKey) {
        throw new Error("Chave de API da IA não configurada. Configure em /admin/settings.")
    }

    return { provider, model, apiKey }
}

function buildExtractionPrompt(subjects: SubjectRef[], contents: ContentRef[]) {
    const subjectList = subjects.map((s) => `- ${s.id} | ${s.name}`).join("\n")
    const contentList = contents.map((c) => `- ${c.id} | ${c.name} (subject: ${c.subjectId})`).join("\n")

    return `Você é um extrator de questões de provas de concurso/vestibular em português. Analise a imagem/PDF anexo e extraia a questão em JSON.

DISCIPLINAS DISPONÍVEIS (escolha o id da mais provável):
${subjectList}

CONTEÚDOS DISPONÍVEIS (escolha o id mais específico ou null):
${contentList || "(nenhum)"}

Retorne APENAS um JSON válido (sem markdown, sem explicação) no formato:
{
  "stem": "enunciado completo da questão",
  "alternatives": { "A": "texto alternativa A", "B": "...", "C": "...", "D": "...", "E": "..." },
  "subjectId": "id-da-disciplina-escolhida-da-lista-acima",
  "contentId": "id-do-conteudo-ou-null",
  "source": "ex: ENEM 2023 ou null se não identificável",
  "year": 2023
}

Regras:
- O stem deve conter o enunciado completo, preservando contexto, textos de apoio e comandos.
- As alternativas devem vir exatamente como na prova. Se houver menos de 5, preencha as demais chaves com string vazia.
- subjectId e contentId DEVEM ser ids exatos da lista acima ou null. NUNCA invente ids.
- Responda apenas o JSON.`
}

function buildEnrichmentPrompt(stem: string, alternatives: Record<string, string>) {
    const alts = Object.entries(alternatives)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}) ${v}`)
        .join("\n")

    return `Você é um professor especialista. Dada a questão abaixo, identifique a alternativa correta e escreva um breve comentário explicativo (2-4 frases) em português.

QUESTÃO:
${stem}

ALTERNATIVAS:
${alts}

Retorne APENAS um JSON válido (sem markdown, sem explicação):
{
  "correctAnswer": "A",
  "commentary": "Breve comentário explicando por que a alternativa correta está certa e, se relevante, por que as outras estão erradas."
}`
}

function stripJsonFence(text: string): string {
    return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim()
}

// ── Anthropic ────────────────────────────────────────────────────────────────

async function callAnthropicVision(
    apiKey: string,
    model: string,
    prompt: string,
    fileBase64: string,
    mimeType: string,
): Promise<string> {
    const client = new Anthropic({ apiKey })

    const isPdf = mimeType === "application/pdf"
    const contentBlock = isPdf
        ? {
            type: "document" as const,
            source: {
                type: "base64" as const,
                media_type: "application/pdf" as const,
                data: fileBase64,
            },
        }
        : {
            type: "image" as const,
            source: {
                type: "base64" as const,
                media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: fileBase64,
            },
        }

    const response = await client.messages.create({
        model,
        max_tokens: 2048,
        messages: [{ role: "user", content: [contentBlock, { type: "text", text: prompt }] }],
    })

    const first = response.content[0]
    if (first.type !== "text") throw new Error("Resposta da IA não contém texto.")
    return first.text
}

async function callAnthropicText(apiKey: string, model: string, prompt: string): Promise<string> {
    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
        model,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
    })
    const first = response.content[0]
    if (first.type !== "text") throw new Error("Resposta da IA não contém texto.")
    return first.text
}

// ── OpenAI ───────────────────────────────────────────────────────────────────

async function callOpenAIVision(
    apiKey: string,
    model: string,
    prompt: string,
    fileBase64: string,
    mimeType: string,
): Promise<string> {
    const client = new OpenAI({ apiKey })
    const dataUrl = `data:${mimeType};base64,${fileBase64}`

    const response = await client.chat.completions.create({
        model,
        max_tokens: 2048,
        messages: [
            {
                role: "user",
                content: [
                    { type: "image_url", image_url: { url: dataUrl } },
                    { type: "text", text: prompt },
                ],
            },
        ],
    })

    const text = response.choices[0]?.message?.content
    if (!text) throw new Error("Resposta da IA vazia.")
    return text
}

async function callOpenAIText(apiKey: string, model: string, prompt: string): Promise<string> {
    const client = new OpenAI({ apiKey })
    const response = await client.chat.completions.create({
        model,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
    })
    const text = response.choices[0]?.message?.content
    if (!text) throw new Error("Resposta da IA vazia.")
    return text
}

// ── Google Gemini ─────────────────────────────────────────────────────────────

async function callGoogleVision(
    apiKey: string,
    model: string,
    prompt: string,
    fileBase64: string,
    mimeType: string,
): Promise<string> {
    const client = new GoogleGenAI({ apiKey })

    const response = await client.models.generateContent({
        model,
        contents: [
            {
                role: "user",
                parts: [
                    { inlineData: { mimeType, data: fileBase64 } },
                    { text: prompt },
                ],
            },
        ],
    })

    const text = response.text
    if (!text) throw new Error("Resposta da IA vazia.")
    return text
}

async function callGoogleText(apiKey: string, model: string, prompt: string): Promise<string> {
    const client = new GoogleGenAI({ apiKey })

    const response = await client.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
    })

    const text = response.text
    if (!text) throw new Error("Resposta da IA vazia.")
    return text
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function extractQuestion(
    fileBuffer: Buffer,
    mimeType: string,
    subjects: SubjectRef[],
    contents: ContentRef[],
): Promise<ExtractedQuestion> {
    const { provider, model, apiKey } = await loadAISettings()
    const prompt = buildExtractionPrompt(subjects, contents)
    const fileBase64 = fileBuffer.toString("base64")

    let raw: string
    if (provider === "anthropic") {
        raw = await callAnthropicVision(apiKey, model, prompt, fileBase64, mimeType)
    } else if (provider === "openai") {
        raw = await callOpenAIVision(apiKey, model, prompt, fileBase64, mimeType)
    } else if (provider === "google") {
        raw = await callGoogleVision(apiKey, model, prompt, fileBase64, mimeType)
    } else {
        throw new Error(`Provedor de IA desconhecido: ${provider}`)
    }

    const json = stripJsonFence(raw)
    let parsed: ExtractedQuestion
    try {
        parsed = JSON.parse(json)
    } catch {
        throw new Error(`Resposta da IA não é JSON válido: ${json.slice(0, 200)}`)
    }

    const subjectIds = new Set(subjects.map((s) => s.id))
    const contentIds = new Set(contents.map((c) => c.id))
    if (parsed.subjectId && !subjectIds.has(parsed.subjectId)) parsed.subjectId = null
    if (parsed.contentId && !contentIds.has(parsed.contentId)) parsed.contentId = null

    return parsed
}

export async function enrichQuestion(
    stem: string,
    alternatives: Record<string, string>,
): Promise<EnrichedQuestion> {
    const { provider, model, apiKey } = await loadAISettings()
    const prompt = buildEnrichmentPrompt(stem, alternatives)

    let raw: string
    if (provider === "anthropic") {
        raw = await callAnthropicText(apiKey, model, prompt)
    } else if (provider === "openai") {
        raw = await callOpenAIText(apiKey, model, prompt)
    } else if (provider === "google") {
        raw = await callGoogleText(apiKey, model, prompt)
    } else {
        throw new Error(`Provedor de IA desconhecido: ${provider}`)
    }

    const json = stripJsonFence(raw)
    try {
        return JSON.parse(json) as EnrichedQuestion
    } catch {
        throw new Error(`Resposta da IA não é JSON válido: ${json.slice(0, 200)}`)
    }
}

export async function testAIConnection(): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
        const { provider, model, apiKey } = await loadAISettings()
        if (provider === "anthropic") {
            await callAnthropicText(apiKey, model, "Responda apenas com a palavra: OK")
        } else if (provider === "openai") {
            await callOpenAIText(apiKey, model, "Responda apenas com a palavra: OK")
        } else if (provider === "google") {
            await callGoogleText(apiKey, model, "Responda apenas com a palavra: OK")
        } else {
            return { ok: false, error: `Provedor desconhecido: ${provider}` }
        }
        return { ok: true }
    } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
}
