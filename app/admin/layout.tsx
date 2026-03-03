import { AppSidebar } from "@/components/layout/AppSidebar"
import { AppHeader } from "@/components/layout/AppHeader"
import { MobileSidebar } from "@/components/layout/MobileSidebar"
import { SidebarProvider } from "@/components/layout/SidebarContext"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "MENTOR"].includes(session.user.role)) {
        return (
            <div className="flex items-center justify-center p-12 text-center h-screen space-y-4">
                <h2 className="text-2xl font-bold text-destructive">Acesso Negado</h2>
                <p className="text-muted-foreground">Logue com uma conta de administrador ou mentor.</p>
                <a href="/signin" className="text-primary hover:underline">Ir para Login</a>
            </div>
        )
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden bg-background text-foreground">
                <AppSidebar role={session.user.role} userEmail={session.user.email} />
                <MobileSidebar role={session.user.role} />
                <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
                    <AppHeader userName={session.user.name} userRole={session.user.role} />
                    <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
