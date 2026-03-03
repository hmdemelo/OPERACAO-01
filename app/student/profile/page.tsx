import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { ProfileForm } from "@/components/student/ProfileForm"

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

    if (!user) redirect("/signin")

    // Pass data to Client Component with key to force re-mount on data change
    return <ProfileForm key={JSON.stringify(user)} initialData={user} />
}