import { AppSidebar } from "@/components/layout/AppSidebar"
import { AppHeader } from "@/components/layout/AppHeader"
import { MobileSidebar } from "@/components/layout/MobileSidebar"
import { SidebarProvider } from "@/components/layout/SidebarContext"
import { HeartbeatEmitter } from "@/components/layout/HeartbeatEmitter"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/db"
import { getSetting } from "@/lib/settings"

export default async function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)
    const [appVersion, questionsEnabledRaw] = await Promise.all([
        session?.user?.id
            ? prisma.user.findUnique({ where: { id: session.user.id }, select: { appVersion: true } }).then(u => u?.appVersion ?? "v1")
            : Promise.resolve("v1"),
        getSetting("student_questions_enabled"),
    ])
    const questionsEnabled = questionsEnabledRaw !== "false"

    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden bg-background text-foreground">
                <AppSidebar role="STUDENT" userEmail={session?.user.email} appVersion={appVersion} questionsEnabled={questionsEnabled} />
                <MobileSidebar role="STUDENT" appVersion={appVersion} questionsEnabled={questionsEnabled} />
                <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
                    <AppHeader userName={session?.user.name} userRole="STUDENT" />
                    <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
            <HeartbeatEmitter />
        </SidebarProvider>
    )
}
