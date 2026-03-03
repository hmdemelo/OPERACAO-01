"use client"

import { LogOut, PanelLeft, Menu } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSidebar } from "./SidebarContext"

interface AppHeaderProps {
    userName?: string | null
    userRole?: string
}

export function AppHeader({ userName, userRole }: AppHeaderProps) {
    const { toggleSidebar, setMobileOpen } = useSidebar()

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
                {/* Mobile Trigger */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileOpen(true)}
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                </Button>

                {/* Desktop Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex text-muted-foreground hover:text-foreground"
                    onClick={toggleSidebar}
                    title="Alternar Menu Lateral"
                >
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Alternar Menu</span>
                </Button>
            </div>

            <div className="flex items-center gap-4 ml-auto">
                <div className="flex flex-col items-end hidden md:flex text-sm">
                    <span className="font-medium">{userName || "Usuário"}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 uppercase">
                        {userRole === "ADMIN"
                            ? "ADMINISTRADOR"
                            : userRole === "MENTOR"
                                ? "MENTOR"
                                : userRole === "STUDENT" ? "ALUNO" : userRole}
                    </Badge>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={async () => {
                        await signOut({ redirect: false })
                        window.location.href = "/"
                    }}
                    title="Sair"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Sair</span>
                </Button>
            </div>
        </header>
    )
}
