import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"

// Destino pós-login resolvido no servidor: evita o round-trip extra de
// fetch("/api/auth/session") no cliente e manda o aluno v2 direto para a Fase 1,
// sem passar pelo /student/dashboard (que só redirecionaria de novo).
export default async function PostLoginPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/signin")
    }

    const role = session.user.role

    if (role === "ADMIN" || role === "MENTOR") {
        redirect("/admin/dashboard")
    }

    if (role === "STUDENT") {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { appVersion: true },
        })
        redirect(user?.appVersion === "v2" ? "/student/fase1" : "/student/dashboard")
    }

    redirect("/")
}
