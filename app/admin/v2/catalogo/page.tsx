import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { CatalogEditor } from "@/components/admin/v2/CatalogEditor"

export default async function V2CatalogPage() {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        redirect("/signin")
    }

    const subjects = await prisma.subjectV2.findMany({
        where: { active: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: {
            contents: {
                orderBy: [{ order: "asc" }, { name: "asc" }],
                include: {
                    topics: { orderBy: [{ order: "asc" }, { title: "asc" }] },
                },
            },
        },
    })

    return (
        <div className="container mx-auto p-6 space-y-4">
            <div className="space-y-1">
                <h1 className="text-3xl font-black uppercase tracking-tighter">Catálogo V2</h1>
                <p className="text-muted-foreground text-sm">
                    Gerencie disciplinas, conteúdos e assuntos da nova plataforma. Estes dados servem de base
                    para a grade de todos os alunos V2.
                </p>
            </div>
            <CatalogEditor initialSubjects={subjects} />
        </div>
    )
}
