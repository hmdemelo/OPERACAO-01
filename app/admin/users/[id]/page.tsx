
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { ProfileForm } from "@/components/student/ProfileForm"
import { Role } from "@prisma/client"

export default async function AdminUserEditPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        redirect("/admin/dashboard")
    }

    const { id } = await params

    const [user, mentors] = await Promise.all([
        prisma.user.findUnique({
            where: { id },
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
                role: true,
                active: true,
                userSubjects: { select: { subjectId: true } },
                userConcursos: { select: { concursoId: true } },
                // @ts-ignore
                studentLink: { select: { mentorId: true } }
            }
        }),
        prisma.user.findMany({
            where: { role: { in: ["ADMIN" as any, "MENTOR" as any] }, active: true },
            select: { id: true, name: true, email: true }
        })
    ])

    if (!user) {
        return <div className="p-8">Usuário não encontrado</div>
    }

    // SECURITY GUARD: Ensure mentor is not trying to edit another mentor's student
    if (user.role === "STUDENT") {
        const studentLink = (user as any).studentLink;
        const studentMentorId = studentLink?.mentorId;
        const isOrphan = !studentMentorId;
        const isMyStudent = studentMentorId === session.user.id;

        if (!isMyStudent && !isOrphan) {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-center h-screen space-y-4">
                    <h2 className="text-2xl font-bold text-destructive">Acesso Negado</h2>
                    <p className="text-muted-foreground">
                        Você não tem permissão para visualizar ou editar este aluno, pois ele pertence a outro mentor.
                    </p>
                    <a href="/admin/users" className="text-primary hover:underline">
                        Voltar para Usuários
                    </a>
                </div>
            )
        }
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="flex flex-col h-full">
                <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
                    <div className="container mx-auto py-4 px-4 flex items-center justify-between">
                        <div className="flex flex-col">
                            <a
                                href="/admin/users"
                                className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1 mb-1 transition-colors"
                            >
                                ← Gerenciamento de Usuários
                            </a>
                            <h1 className="text-xl font-bold tracking-tight">Editar Usuário</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Painel Admin
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-7xl mx-auto">
                    <ProfileForm
                        initialData={user}
                        actionUrl={`/api/admin/users/${id}`}
                        onSuccessRedirect="/admin/users"
                        isAdmin={true}
                        mentors={mentors}
                    />
                </div>
            </div>
        </main>
    )
}
