import { AppSidebar } from "@/components/layout/AppSidebar"
import { AppHeader } from "@/components/layout/AppHeader"
import { MobileSidebar } from "@/components/layout/MobileSidebar"
import { SidebarProvider } from "@/components/layout/SidebarContext"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"

export default async function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden bg-background text-foreground">
                <AppSidebar role="STUDENT" userEmail={session?.user.email} />
                <MobileSidebar role="STUDENT" />
                <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
                    <AppHeader userName={session?.user.name} userRole="STUDENT" />
                    <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
