
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db";

export async function getFeaturedStudents() {
    try {
        const students = await prisma.featuredStudent.findMany({
            where: { active: true },
            orderBy: { order: "asc" }
        });
        return students;
    } catch (error) {
        logger.error("Failed to fetch featured students:", error);
        return [];
    }
}

export async function getMethodItems() {
    try {
        const items = await prisma.methodItem.findMany({
            where: { active: true },
            orderBy: { order: "asc" }
        });
        return items;
    } catch (error) {
        logger.error("Failed to fetch method items:", error);
        return [];
    }
}
