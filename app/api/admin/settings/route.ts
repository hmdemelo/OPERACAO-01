import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { NextResponse } from "next/server"
import { getAllSettings, setManySettings, SETTING_KEYS } from "@/lib/settings"
import { z } from "zod"

const patchSchema = z.object({
    settings: z.array(
        z.object({
            key: z.string(),
            value: z.string(),
        })
    ),
})

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const settings = await getAllSettings()
        return NextResponse.json(settings)
    } catch {
        return new NextResponse("Erro interno", { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 })
    }

    try {
        const json = await req.json()
        const { settings } = patchSchema.parse(json)

        // Security: only allow whitelisted keys
        const invalidKeys = settings.filter((s) => !SETTING_KEYS.includes(s.key))
        if (invalidKeys.length > 0) {
            return new NextResponse(
                `Chaves inválidas: ${invalidKeys.map((k) => k.key).join(", ")}`,
                { status: 400 }
            )
        }

        await setManySettings(settings)
        const updated = await getAllSettings()
        return NextResponse.json(updated)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        return new NextResponse("Erro interno", { status: 500 })
    }
}
