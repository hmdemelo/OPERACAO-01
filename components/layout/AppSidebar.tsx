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
    appVersion?: string
    questionsEnabled?: boolean
}

export function AppSidebar({ role, appVersion = "v1", questionsEnabled = true }: AppSidebarProps) {
    const pathname = usePathname()
    const { isCollapsed } = useSidebar()

    const baseItems =
        role === "ADMIN" ? adminItems :
            role === "MENTOR" ? mentorItems :
                studentItems

    const items = role === "STUDENT"
        ? baseItems.filter((item: any) => {
            if (item.href === "/student/questions" && !questionsEnabled) return false
            return appVersion === "v2" ? item.v2 !== false : item.v1 !== false
        })
        : baseItems

    const mainItems = items.filter((item: any) => !item.section)
    const sectionedItems = items.filter((item: any) => item.section)
    const sections = Array.from(new Set(sectionedItems.map((i: any) => i.section as string)))

    function renderItem(item: any) {
        return (
            <Link
                key={item.href}
                href={item.href}
                prefetch={item.prefetch}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                    (pathname === item.href || pathname.startsWith(item.href + "/"))
                        ? "bg-secondary text-secondary-foreground shadow-sm"
                        : "text-muted-foreground",
                    isCollapsed && "justify-center px-2"
                )}
            >
                <item.icon className={cn("flex-shrink-0", isCollapsed ? "h-6 w-6" : "h-4 w-4")} />
                {!isCollapsed && <span>{item.label}</span>}
            </Link>
        )
    }

    return (
        <aside
            className={cn(
                "h-screen border-r bg-background flex-col flex-shrink-0 hidden md:flex transition-all duration-300 shrink-0",
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
                {mainItems.map(renderItem)}

                {sections.map((section) => (
                    <div key={section} className="pt-3 space-y-1">
                        <div className="border-t border-border/50 mb-3" />
                        {!isCollapsed && (
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 pb-1">
                                {section}
                            </p>
                        )}
                        {sectionedItems.filter((i: any) => i.section === section).map(renderItem)}
                    </div>
                ))}
            </div>
        </aside>
    )
}
