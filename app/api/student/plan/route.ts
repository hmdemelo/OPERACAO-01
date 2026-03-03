import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { prisma } from '@/lib/db';
import { startOfWeek } from 'date-fns';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine "current week".
    // Or we accept a date parameter but enforce it belongs to the user?
    // User constraint: "GET current week's plan". 
    // Let's assume current real-time week.

    // Allow 'date' param to traverse weeks? User spec said "GET current week plan", but traversing is usually implied.
    // Let's stick to simple "current week" first as per spec, or default to current date.
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const weekStart = startOfWeek(targetDate, { weekStartsOn: 0 }); // Consistency with Admin API

    const plan = await prisma.weeklyPlan.findUnique({
        where: {
            userId_startDate: {
                userId: session.user.id,
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
