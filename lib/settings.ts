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
}

export const SETTING_KEYS = Object.keys(SETTING_DEFAULTS)

// In-memory cache to avoid hitting DB on every request
let cache: Record<string, string> | null = null
let cacheExpiry = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function isCacheValid() {
    return cache !== null && Date.now() < cacheExpiry
}

function invalidateCache() {
    cache = null
    cacheExpiry = 0
}

export async function getAllSettings(): Promise<Record<string, string>> {
    if (isCacheValid()) return cache!

    const rows = await prisma.systemSettings.findMany()
    const result = { ...SETTING_DEFAULTS }

    for (const row of rows) {
        result[row.key] = row.value
    }

    cache = result
    cacheExpiry = Date.now() + CACHE_TTL_MS
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

    invalidateCache()
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

    invalidateCache()
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
