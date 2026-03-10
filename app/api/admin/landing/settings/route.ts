import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 });
    }

    try {
        const settings = await prisma.systemSettings.findMany();
        const config: Record<string, string> = {};
        settings.forEach(s => {
            config[s.key] = s.value;
        });
        return NextResponse.json(config);
    } catch (error) {
        logger.error("[LANDING_SETTINGS_GET]", error);
        return new NextResponse("Erro Interno", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Não autorizado", { status: 401 });
    }

    try {
        const body = await req.json();

        // Upsert multiple settings
        const promises = Object.entries(body).map(([key, value]) => {
            return prisma.systemSettings.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            });
        });

        await Promise.all(promises);

        return new NextResponse("Configurações atualizadas", { status: 200 });
    } catch (error) {
        logger.error("[LANDING_SETTINGS_POST]", error);
        return new NextResponse("Erro Interno", { status: 500 });
    }
}
