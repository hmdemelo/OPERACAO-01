"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "./SidebarContext"
import { Logo } from "@/components/landing/Logo"
import { adminItems, mentorItems, studentItems } from "./menu-items"

interface AppSidebarProps {
    role: "ADMIN" | "MENTOR" | "STUDENT"
    userEmail?: string | null
}

export function AppSidebar({ role }: AppSidebarProps) {
    const pathname = usePathname()
    const { isCollapsed } = useSidebar()

    const items =
        role === "ADMIN" ? adminItems :
            role === "MENTOR" ? mentorItems :
                studentItems

    return (
        <aside
            className={cn(
                "sticky top-0 z-40 h-screen border-r bg-background flex-col flex-shrink-0 hidden md:flex transition-all duration-300",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className={cn(
                "flex h-16 items-center border-b bg-background transition-all duration-300",
                isCollapsed ? "justify-center px-0" : "justify-center px-0"
            )}>
                <Logo size="sm" />
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        prefetch={(item as any).prefetch}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                            pathname === item.href
                                ? "bg-secondary text-secondary-foreground shadow-sm"
                                : "text-muted-foreground",
                            isCollapsed && "justify-center px-2"
                        )}
                    >
                        <item.icon className={cn("flex-shrink-0", isCollapsed ? "h-6 w-6" : "h-4 w-4")} />
                        {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </div>
        </aside>
    )
}
