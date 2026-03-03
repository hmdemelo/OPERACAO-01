
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export async function GET() {
    try {
        const items = await prisma.methodItem.findMany({
            orderBy: { order: "asc" }
        });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const count = await prisma.methodItem.count();

        const newItem = await prisma.methodItem.create({
            data: {
                ...data,
                order: count // append to end
            }
        });
        return NextResponse.json(newItem);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
    }
}
