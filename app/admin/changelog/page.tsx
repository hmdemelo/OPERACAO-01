import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { ChangelogForm } from "@/components/admin/changelog/ChangelogForm"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

function getCategoryStyles(category: string) {
    switch (category) {
        case 'NEW': return { icon: '✨', label: 'Novidades', color: 'text-primary' }
        case 'IMPROVEMENT': return { icon: '⚙️', label: 'Melhorias', color: 'text-blue-500' }
        case 'FIX': return { icon: '🐛', label: 'Correções', color: 'text-orange-500' }
        default: return { icon: '📌', label: 'Geral', color: 'text-muted-foreground' }
    }
}

export default async function ChangelogPage() {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        redirect("/signin")
    }

    const entries = await prisma.changelogEntry.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' }
    })

    // Group entries by version
    const groupedEntries: Record<string, typeof entries> = {}
    entries.forEach(entry => {
        if (!groupedEntries[entry.version]) {
            groupedEntries[entry.version] = []
        }
        groupedEntries[entry.version].push(entry)
    })

    const versions = Object.keys(groupedEntries)

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Mural de Atualizações</h1>
                <p className="text-muted-foreground mt-1">Novidades, correções e melhorias da plataforma</p>
            </div>

            {session.user.role === "ADMIN" && <ChangelogForm />}

            <div className="relative">
                <div className="absolute left-[11px] top-2 bottom-0 w-px bg-border" />

                <div className="space-y-10">
                    {versions.length === 0 ? (
                        <div className="pl-10 text-muted-foreground italic">
                            Nenhuma atualização publicada ainda.
                        </div>
                    ) : versions.map((version) => (
                        <div key={version} className="relative pl-10">
                            <div className="absolute left-0 top-1 w-[23px] h-[23px] rounded-full bg-primary flex items-center justify-center">
                                <span className="text-[10px] text-primary-foreground font-bold">🚀</span>
                            </div>

                            <div className="flex items-baseline gap-3 mb-4">
                                <span className="text-xl font-bold">{version}</span>
                                <span className="text-sm text-muted-foreground">
                                    {format(groupedEntries[version][0].date, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {groupedEntries[version].map((entry) => {
                                    const { icon, label } = getCategoryStyles(entry.category)
                                    return (
                                        <div key={entry.id} className="border rounded-lg p-4 bg-card">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <span>{icon}</span> {entry.title}
                                                <span className="text-[10px] font-normal lowercase bg-muted px-1.5 py-0.5 rounded ml-auto">
                                                    {label}
                                                </span>
                                            </h3>
                                            <div
                                                className="text-sm leading-relaxed space-y-1"
                                                dangerouslySetInnerHTML={{
                                                    __html: entry.content
                                                        .replace(/\n/g, '<br/>')
                                                        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                                                        .replace(/—/g, '<span class="text-muted-foreground mx-1">—</span>')
                                                }}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
