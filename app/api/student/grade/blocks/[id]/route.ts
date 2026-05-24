import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

// f3Notes/f3Result were removed from StudyBlock. Simulation data is now
// managed via /api/student/simulations/blocks/[blockId].
export async function PATCH() {
    return new NextResponse("Endpoint removido. Use /api/student/simulations/blocks/[id].", { status: 410 })
}
