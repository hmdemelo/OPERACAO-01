import { logger } from "@/lib/logger";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { addDays } from 'date-fns';

const updateSchema = z.object({
    completed: z.boolean(),
    questionsDone: z.number().int().optional(),
    correctCount: z.number().int().optional()
});

export async function PATCH(req: Request, props: { params: Promise<{ itemId: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { completed, questionsDone, correctCount } = updateSchema.parse(body);
        const { itemId } = params;

        // Verify ownership
        const item = await prisma.weeklyPlanItem.findUnique({
            where: { id: itemId },
            include: { plan: true }
        });

        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        if (item.plan.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (completed) {
            // MARK AS COMPLETED -> CREATE LOG
            // Only create if not already linked? Or assume unique?
            // If item.studyLogId exists, update it? For now, let's assume simple flow.

            let targetSubjectId = item.subjectId;
            let contentId: string | null = null;
            let topicName = item.content || "Estudo Planificado";

            // If no explicit subject, try to infer or fallback
            if (!targetSubjectId) {
                console.warn("Plan item missing subjectId, attempting fallback for item:", itemId);

                // 1. Try to match content string to a Subject name
                if (item.content) {
                    const potentialSubject = await prisma.subject.findFirst({
                        where: { name: { contains: item.content, mode: 'insensitive' } }
                    });
                    if (potentialSubject) {
                        targetSubjectId = potentialSubject.id;
                    }
                }

                // 2. If still null, fallback to 'Geral' or 'Outros' subject
                if (!targetSubjectId) {
                    const generalSubject = await prisma.subject.findFirst({
                        where: { name: { in: ['Geral', 'Outros', 'General'], mode: 'insensitive' } }
                    });

                    if (generalSubject) {
                        targetSubjectId = generalSubject.id;
                    } else {
                        // CRITICAL FALLBACK: If 'Geral' doesn't exist, we MUST create it or fail.
                        // Ideally checking this in a seed, but here we can't create subject on fly easily without risk.
                        // Let's create one safe fallback if possible, or return error.
                        // For now, logging error and returning item (dashboard won't update, but app won't crash)
                        logger.error("CRITICAL: No 'Geral' subject found for fallback. Dashboard metrics will be inaccurate.");

                        // Update item status only
                        const updated = await prisma.weeklyPlanItem.update({
                            where: { id: itemId },
                            data: {
                                completed,
                                questionsDone: questionsDone ?? undefined,
                                correctCount: correctCount ?? undefined
                            }
                        });
                        return NextResponse.json(updated);
                    }
                }
            }

            // Calculate Date
            const logDate = addDays(item.plan.startDate, item.dayOfWeek);

            // Calculate Content ID if we have a subject
            if (item.content && targetSubjectId) {
                const content = await prisma.content.findFirst({
                    where: {
                        subjectId: targetSubjectId,
                        name: { equals: item.content, mode: 'insensitive' }
                    }
                });
                if (content) {
                    contentId = content.id;
                }
            }

            // Transaction: Create Log + Update Item
            const [log, updatedItem] = await prisma.$transaction(async (tx) => {
                // Create StudyLog
                const newLog = await tx.studyLog.create({
                    data: {
                        userId: session.user.id,
                        subjectId: targetSubjectId!, // Guaranteed by checks above
                        contentId: contentId,
                        topic: topicName,
                        date: logDate,
                        hoursStudied: (item.durationMinutes || 0) / 60,
                        questionsAnswered: questionsDone || item.questionsDone || 0,
                        correctAnswers: correctCount ?? item.correctCount ?? 0,
                    }
                });

                // Update Item with FK
                const updated = await tx.weeklyPlanItem.update({
                    where: { id: itemId },
                    data: {
                        completed: true,
                        questionsDone: questionsDone ?? undefined,
                        correctCount: correctCount ?? undefined,
                        studyLogId: newLog.id,
                        // Optionally update the item's subjectId to the inferred one so subsequent toggles are faster?
                        // subjectId: targetSubjectId 
                    }
                });

                return [newLog, updated];
            });

            return NextResponse.json(updatedItem);

        } else {
            // UNCHECK -> REMOVE LOG
            // If linked log exists, delete it.
            await prisma.$transaction(async (tx) => {
                if (item.studyLogId) {
                    await tx.studyLog.delete({
                        where: { id: item.studyLogId }
                    }).catch(() => null); // Ignore if already deleted
                }

                await tx.weeklyPlanItem.update({
                    where: { id: itemId },
                    data: {
                        completed: false,
                        studyLogId: null
                        // Keep perf data or clear? Usually keep history in case execution was real. 
                        // But if unchecking means "didn't do it", maybe clear? 
                        // Let's keep data as draft logic, just uncompleted.
                    }
                });
            });

            const updated = await prisma.weeklyPlanItem.findUnique({ where: { id: itemId } });
            return NextResponse.json(updated);
        }
    } catch (error) {
        logger.error("Error updating plan item:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
