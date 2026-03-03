
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { ProfileForm } from "@/components/student/ProfileForm"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePageWrapper() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/signin")
    }

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
    })

    logger.info("[ProfilePage] User Data found:", user ? "YES" : "NO");
    if (user) logger.info("[ProfilePage] Data:", JSON.stringify(user));

    if (!user) redirect("/signin")

    // Pass data to Client Component with key to force re-mount on data change
    return <ProfileForm key={JSON.stringify(user)} initialData={user} />
}
