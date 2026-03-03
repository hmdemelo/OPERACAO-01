
import { logger } from "@/lib/logger";
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Zod schema for validation
const profileSchema = z.object({
    name: z.string().min(2, "Nome muito curto"),
    email: z.string().email("E-mail inválido").optional(), // Usually email is read-only or requires verify, let's allow basic edit for now or just read.
    // Actually, let's keep email separate or read-only if it's the ID.
    // User asked for email to be login.
    phone: z.string().optional().nullable(),
    cpf: z.string().optional().nullable(),
    birthDate: z.string().optional().nullable().transform(str => str ? new Date(str) : null), // Receive as string YYYY-MM-DD
    targetExam: z.string().optional().nullable(),
    educationLevel: z.string().optional().nullable(),
    dailyHours: z.number().int().min(0).max(24).optional().nullable(),
    addressCity: z.string().optional().nullable(),
    addressState: z.string().optional().nullable(),
});

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                name: true,
                email: true,
                phone: true,
                cpf: true,
                birthDate: true,
                targetExam: true,
                educationLevel: true,
                dailyHours: true,
                addressCity: true,
                addressState: true,
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // DEBUG LOGGING
        const fs = require('fs');
        const path = require('path');
        const log = (msg: string) => {
            logger.info(msg);
            fs.appendFileSync(path.join(process.cwd(), 'debug_profile.log'), msg + '\n');
        };

        log(`[${new Date().toISOString()}] PATCH /api/user/profile`);
        log(`User ID: ${session.user.id}`);
        log(`Body Received: ${JSON.stringify(body)}`);

        // ZOD VALIDATION CHECK
        const result = profileSchema.safeParse(body);

        if (!result.success) {
            log(`ZOD ERROR: ${JSON.stringify(result.error.flatten())}`);
            return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
        }

        const data = result.data;
        log(`Normalized Data for Update: ${JSON.stringify(data)}`);

        log("BEFORE UPDATE (Prisma Call Starting...)");

        try {
            const updatedUser = await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    name: data.name,
                    phone: data.phone,
                    cpf: data.cpf,
                    birthDate: data.birthDate,
                    targetExam: data.targetExam,
                    educationLevel: data.educationLevel,
                    dailyHours: data.dailyHours,
                    addressCity: data.addressCity,
                    addressState: data.addressState,
                }
            });

            log(`AFTER UPDATE: Success! Updated User: ${JSON.stringify(updatedUser)}`);
            revalidatePath('/student/profile');
            log(`Revalidated path /student/profile`);

            return NextResponse.json(updatedUser);
        } catch (dbError) {
            log(`DB UPDATE ERROR: ${dbError}`);
            throw dbError; // Let outer catch handle 500
        }
    } catch (error) {
        logger.error("Profile update error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: (error as any).errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
