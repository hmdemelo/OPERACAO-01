import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import fs from "fs"
import path from "path"

// Simple markdown parser for the changelog
function parseChangelog(markdown: string) {
    const sections: { version: string; date: string; groups: { title: string; icon: string; items: string[] }[] }[] = []
    let currentSection: typeof sections[number] | null = null
    let currentGroup: { title: string; icon: string; items: string[] } | null = null

    const lines = markdown.split("\n")

    for (const line of lines) {
        // Version header: ## 🚀 v1.3.0 — 01/03/2025
        const versionMatch = line.match(/^## .+ (v[\d.]+)\s*—\s*(.+)$/)
        if (versionMatch) {
            currentSection = { version: versionMatch[1], date: versionMatch[2].trim(), groups: [] }
            sections.push(currentSection)
            currentGroup = null
            continue
        }

        // Group header: ### ✨ Novidades
        const groupMatch = line.match(/^### (.+)$/)
        if (groupMatch && currentSection) {
            const title = groupMatch[1].replace(/^[^\w]+/, "").trim()
            const icon = groupMatch[1].match(/^([^\w\s]+)/)?.[1] || "📌"
            currentGroup = { title, icon: icon.trim(), items: [] }
            currentSection.groups.push(currentGroup)
            continue
        }

        // Item: - **Feature** — Description
        const itemMatch = line.match(/^- (.+)$/)
        if (itemMatch && currentGroup) {
            currentGroup.items.push(itemMatch[1])
            continue
        }
    }

    return sections
}

export default async function ChangelogPage() {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        redirect("/signin")
    }

    const changelogPath = path.join(process.cwd(), "CHANGELOG.md")
    let rawContent = ""

    try {
        rawContent = fs.readFileSync(changelogPath, "utf-8")
    } catch {
        rawContent = "## Sem atualizações\n\nNenhuma atualização disponível no momento."
    }

    const sections = parseChangelog(rawContent)

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Mural de Atualizações</h1>
                <p className="text-muted-foreground mt-1">Novidades, correções e melhorias da plataforma</p>
            </div>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[11px] top-2 bottom-0 w-px bg-border" />

                <div className="space-y-10">
                    {sections.map((section, idx) => (
                        <div key={idx} className="relative pl-10">
                            {/* Timeline dot */}
                            <div className="absolute left-0 top-1 w-[23px] h-[23px] rounded-full bg-primary flex items-center justify-center">
                                <span className="text-[10px] text-primary-foreground font-bold">🚀</span>
                            </div>

                            {/* Version header */}
                            <div className="flex items-baseline gap-3 mb-4">
                                <span className="text-xl font-bold">{section.version}</span>
                                <span className="text-sm text-muted-foreground">{section.date}</span>
                            </div>

                            {/* Groups */}
                            <div className="space-y-4">
                                {section.groups.map((group, gIdx) => (
                                    <div key={gIdx} className="border rounded-lg p-4 bg-card">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                            {group.icon} {group.title}
                                        </h3>
                                        <ul className="space-y-2">
                                            {group.items.map((item, iIdx) => (
                                                <li
                                                    key={iIdx}
                                                    className="text-sm leading-relaxed"
                                                    dangerouslySetInnerHTML={{
                                                        __html: item
                                                            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                                                            .replace(/—/g, '<span class="text-muted-foreground mx-1">—</span>')
                                                    }}
                                                />
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
