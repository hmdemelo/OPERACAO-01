import { logger } from "@/lib/logger";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { prisma } from '@/lib/db';
import { isValid, parseISO } from 'date-fns';
import { getAraguainaStartOfWeek } from '@/lib/date-utils';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('weekStart');

    // Default to current week start if not provided
    let weekStart = getAraguainaStartOfWeek(new Date());

    if (dateParam) {
        const parsed = parseISO(dateParam);
        if (isValid(parsed)) {
            weekStart = getAraguainaStartOfWeek(parsed);
        }
    }

    try {
        const userRole = session.user.role as string

        // Mentor: sees only their linked students
        // Admin: sees all active students
        const studentWhere: any = userRole === "MENTOR"
            ? {
                role: 'STUDENT',
                active: true,
                studentLink: { mentorId: session.user.id },
            }
            : {
                role: 'STUDENT',
                active: true,
            }

        // Fetch students along with their plan for the specific week
        const students = await prisma.user.findMany({
            where: studentWhere,
            select: {
                id: true,
                name: true,
                email: true,
                active: true,
                weeklyPlans: {
                    where: {
                        startDate: weekStart,
                    },
                    include: {
                        items: {
                            select: {
                                completed: true
                            }
                        }
                    },
                    take: 1
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Map to Overview DTO
        const overview = students.map((student: any) => {
            const plan = student.weeklyPlans?.[0]; // Can be undefined

            if (!plan) {
                return {
                    userId: student.id,
                    name: student.name,
                    email: student.email,
                    active: student.active,
                    hasPlan: false,
                    totalBlocks: 0,
                    completedBlocks: 0,
                    progressPercentage: 0,
                    status: "PENDING"
                };
            }

            const totalBlocks = plan.items.length;
            const completedBlocks = plan.items.filter((i: any) => i.completed).length;

            // Avoid division by zero
            const progressPercentage = totalBlocks > 0
                ? Math.round((completedBlocks / totalBlocks) * 100)
                : 0;

            let status = "PENDING";
            if (totalBlocks > 0) {
                if (progressPercentage === 100) {
                    status = "COMPLETED";
                } else {
                    status = "IN_PROGRESS";
                }
            } else {
                // If plan exists but has 0 blocks? Treat as Pending or Empty?
                // Requirements say: "PENDING: no WeeklyPlan for week". 
                // But if plan exists with 0 items, technically hasPlan=true.
                // Let's assume In Progress (0%) or maybe Pending if empty? 
                // Let's stick to "IN_PROGRESS" for existing plan < 100%, but 0 items means progress is 0/0 -> 0.
                // Effectively "IN_PROGRESS" with 0 items is weird.
                // Revisiting requirements: "PENDING: no WeeklyPlan for week".
                // If hasPlan is true, start with IN_PROGRESS.
                status = "IN_PROGRESS";
            }

            // Override for 100% case handled above.

            return {
                userId: student.id,
                name: student.name,
                email: student.email,
                active: student.active,
                hasPlan: true,
                totalBlocks,
                completedBlocks,
                progressPercentage,
                status
            };
        });

        return NextResponse.json(overview);
    } catch (error) {
        logger.error("Error fetching plans overview:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
