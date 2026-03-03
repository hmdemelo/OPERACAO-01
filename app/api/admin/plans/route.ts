import { logger } from "@/lib/logger";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { startOfWeek } from 'date-fns';

const planSchema = z.object({
    userId: z.string(),
    startDate: z.string(), // ISO date string
    items: z.array(z.object({
        dayOfWeek: z.number().min(0).max(6), // 0=Sunday
        blockIndex: z.number(),
        subjectId: z.string().optional().nullable(),
        content: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        durationMinutes: z.number().int().optional().nullable(),
    })),
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { userId, startDate, items } = planSchema.parse(body);

        const weekStart = startOfWeek(new Date(startDate), { weekStartsOn: 0 });

        // Upsert Plan
        // Prisma requires explicit null for optional fields in create/update if they are undefined in the object
        const plan = await prisma.weeklyPlan.upsert({
            where: {
                userId_startDate: {
                    userId,
                    startDate: weekStart,
                },
            },
            update: {
                items: {
                    deleteMany: {}, // Clear existing items to rewrite
                    create: items.map(item => ({
                        dayOfWeek: item.dayOfWeek,
                        blockIndex: item.blockIndex,
                        subjectId: item.subjectId || null,
                        content: item.content || null,
                        notes: item.notes || null,
                        durationMinutes: item.durationMinutes || null,
                    })),
                },
            },
            create: {
                userId,
                startDate: weekStart,
                items: {
                    create: items.map(item => ({
                        dayOfWeek: item.dayOfWeek,
                        blockIndex: item.blockIndex,
                        subjectId: item.subjectId || null,
                        content: item.content || null,
                        notes: item.notes || null,
                        durationMinutes: item.durationMinutes || null,
                    })),
                },
            },
        });

        return NextResponse.json(plan);
    } catch (error) {
        logger.error('CRITICAL ERROR saving plan:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const dateStr = searchParams.get('date');

    if (!userId || !dateStr) {
        return NextResponse.json({ error: 'Missing userId or date' }, { status: 400 });
    }

    const weekStart = startOfWeek(new Date(dateStr), { weekStartsOn: 0 });

    const plan = await prisma.weeklyPlan.findUnique({
        where: {
            userId_startDate: {
                userId,
                startDate: weekStart
            }
        },
        include: {
            items: true
        }
    });

    return NextResponse.json(plan || null);
}
