import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { z } from "zod"

const resetSchema = z.object({
    password: z.string().min(6),
})

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const json = await req.json()
        const { password } = resetSchema.parse(json)
        const { id } = await params

        const passwordHash = await bcrypt.hash(password, 10)

        await prisma.user.update({
            where: { id },
            data: { passwordHash },
        })

        return new NextResponse("Password updated", { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 })
        }
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
