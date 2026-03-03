
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/student/ProfileForm"
import { prisma } from "@/lib/db"
import { Role } from "@prisma/client"

export default async function AdminUserCreatePage() {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        redirect("/signin")
    }

    const mentors = await prisma.user.findMany({
        where: { role: { in: [Role.ADMIN, Role.MENTOR] }, active: true },
        select: { id: true, name: true, email: true }
    })

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center gap-4">
                <a href="/admin/users" className="text-sm font-medium hover:underline text-muted-foreground">
                    ← Voltar para Gerenciamento de Usuários
                </a>
            </div>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Adicionar Novo Usuário</h1>
                <p className="text-muted-foreground">Preencha os dados abaixo para criar um novo usuário no sistema.</p>
            </div>
            <div className="bg-card border rounded-lg p-1">
                <ProfileForm
                    initialData={{
                        // Se o admin for criar um estudante, ele pode vir como seu próprio mentor por padrão.
                        mentorId: session.user.id
                    }}
                    actionUrl="/api/admin/users"
                    onSuccessRedirect="/admin/users"
                    isAdmin={true}
                    isNew={true}
                    mentors={mentors}
                />
            </div>
        </div>
    )
}
