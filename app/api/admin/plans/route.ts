import { logger } from "@/lib/logger";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getAraguainaStartOfWeek } from '@/lib/date-utils';

const planSchema = z.object({
    userId: z.string(),
    startDate: z.string(), // ISO date string
    items: z.array(z.object({
        id: z.string().optional(),
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

        const weekStart = getAraguainaStartOfWeek(startDate);

        // Ensure weekly plan exists for the user/week.
        const plan = await prisma.weeklyPlan.upsert({
            where: {
                userId_startDate: {
                    userId,
                    startDate: weekStart,
                },
            },
            update: {},
            create: {
                userId,
                startDate: weekStart,
            },
        });

        // Load current rows to perform differential save.
        const existingItems = await prisma.weeklyPlanItem.findMany({
            where: { planId: plan.id },
            select: { id: true },
        });
        const existingIds = new Set(existingItems.map((i) => i.id));

        const incomingWithId: typeof items = [];
        const incomingNew: typeof items = [];

        for (const item of items) {
            if (item.id && existingIds.has(item.id)) {
                incomingWithId.push(item);
            } else {
                incomingNew.push(item);
            }
        }

        const keptIds = new Set(incomingWithId.map((i) => i.id!));
        const idsToDelete = existingItems
            .filter((item) => !keptIds.has(item.id))
            .map((item) => item.id);

        await prisma.$transaction(async (tx) => {
            // Update existing blocks without touching completion state or linked study logs.
            for (const item of incomingWithId) {
                await tx.weeklyPlanItem.update({
                    where: { id: item.id! },
                    data: {
                        dayOfWeek: item.dayOfWeek,
                        blockIndex: item.blockIndex,
                        subjectId: item.subjectId || null,
                        content: item.content || null,
                        notes: item.notes || null,
                        durationMinutes: item.durationMinutes || null,
                    },
                });
            }

            // Create only brand-new blocks.
            for (const item of incomingNew) {
                await tx.weeklyPlanItem.create({
                    data: {
                        planId: plan.id,
                        dayOfWeek: item.dayOfWeek,
                        blockIndex: item.blockIndex,
                        subjectId: item.subjectId || null,
                        content: item.content || null,
                        notes: item.notes || null,
                        durationMinutes: item.durationMinutes || null,
                    },
                });
            }

            // Remove blocks that were removed from the editor payload.
            // IMPORTANT: also delete the linked StudyLog so orphaned data doesn't
            // keep appearing on the student dashboard after the admin removes a block.
            if (idsToDelete.length > 0) {
                // 1. Collect studyLogIds of items being deleted
                const itemsToDelete = await tx.weeklyPlanItem.findMany({
                    where: { id: { in: idsToDelete } },
                    select: { id: true, studyLogId: true },
                });
                const studyLogIdsToDelete = itemsToDelete
                    .map((i) => i.studyLogId)
                    .filter((id): id is string => id !== null);

                // 2. Delete the items first (FK points planItem → studyLog)
                await tx.weeklyPlanItem.deleteMany({
                    where: { id: { in: idsToDelete } },
                });

                // 3. Delete orphaned StudyLogs
                if (studyLogIdsToDelete.length > 0) {
                    await tx.studyLog.deleteMany({
                        where: { id: { in: studyLogIdsToDelete } },
                    });
                }
            }
        });

        const updatedPlan = await prisma.weeklyPlan.findUnique({
            where: { id: plan.id },
            include: {
                items: {
                    include: {
                        subject: { select: { name: true } },
                    },
                },
            },
        });

        return NextResponse.json(updatedPlan);
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

    const weekStart = getAraguainaStartOfWeek(dateStr);

    const plan = await prisma.weeklyPlan.findUnique({
        where: {
            userId_startDate: {
                userId,
                startDate: weekStart
            }
        },
        include: {
            items: {
                include: {
                    subject: { select: { name: true } }
                }
            }
        }
    });

    return NextResponse.json(plan || null);
}
