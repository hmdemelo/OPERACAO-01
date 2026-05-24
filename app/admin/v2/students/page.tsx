import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { V2StudentsClient } from "@/components/admin/v2/V2StudentsClient"

export default async function V2StudentsPage() {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        redirect("/signin")
    }

    return <V2StudentsClient role={session.user.role as "ADMIN" | "MENTOR"} />
}
