import { prisma } from "@/lib/db"

// All valid setting keys and their defaults
export const SETTING_DEFAULTS: Record<string, string> = {
    school_name: "Operação 01",
    whatsapp_number: "",
    instagram_url: "",
    linkedin_url: "",
    support_email: "",
    session_max_age: "86400", // 24 hours in seconds
    maintenance_mode: "false",
    mentor_dashboard_widgets: JSON.stringify({
        kpi_cards: true,
        subject_chart: true,
        evolution_chart: true,
        performance_table: true,
        system_alerts: true
    }),
    ai_provider: "anthropic",
    ai_model: "claude-opus-4-7",
    ai_api_key: "",
    student_upload_enabled: "true",
}

export const SETTING_KEYS = Object.keys(SETTING_DEFAULTS)

export async function getAllSettings(): Promise<Record<string, string>> {
    const rows = await prisma.systemSettings.findMany()
    const result = { ...SETTING_DEFAULTS }

    for (const row of rows) {
        result[row.key] = row.value
    }

    return result
}

export async function getSetting(key: string): Promise<string> {
    const all = await getAllSettings()
    return all[key] ?? SETTING_DEFAULTS[key] ?? ""
}

export async function setSetting(key: string, value: string): Promise<void> {
    if (!SETTING_KEYS.includes(key)) {
        throw new Error(`Invalid setting key: ${key}`)
    }

    await prisma.systemSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    })
}

export async function setManySettings(entries: { key: string; value: string }[]): Promise<void> {
    const invalid = entries.filter((e) => !SETTING_KEYS.includes(e.key))
    if (invalid.length > 0) {
        throw new Error(`Invalid setting keys: ${invalid.map((e) => e.key).join(", ")}`)
    }

    await prisma.$transaction(
        entries.map((e) =>
            prisma.systemSettings.upsert({
                where: { key: e.key },
                update: { value: e.value },
                create: { key: e.key, value: e.value },
            })
        )
    )
}

// Typed getters for convenience
export async function getMaintenanceMode(): Promise<boolean> {
    const val = await getSetting("maintenance_mode")
    return val === "true"
}

export async function getSessionMaxAge(): Promise<number> {
    const val = await getSetting("session_max_age")
    return parseInt(val, 10) || 86400
}
