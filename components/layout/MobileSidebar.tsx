"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "./SidebarContext"
import { adminItems, mentorItems, studentItems } from "./menu-items"
import { Logo } from "@/components/landing/Logo"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface MobileSidebarProps {
    role: "ADMIN" | "MENTOR" | "STUDENT"
    appVersion?: string
}

export function MobileSidebar({ role, appVersion = "v1" }: MobileSidebarProps) {
    const pathname = usePathname()
    const { isMobileOpen, setMobileOpen } = useSidebar()
    const baseItems =
        role === "ADMIN" ? adminItems :
            role === "MENTOR" ? mentorItems :
                studentItems

    const items = role === "STUDENT"
        ? baseItems.filter((item: any) => appVersion === "v2" ? item.v2 !== false : item.v1 !== false)
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
                onClick={() => setMobileOpen(false)}
                className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                    (pathname === item.href || pathname.startsWith(item.href + "/"))
                        ? "bg-secondary text-secondary-foreground shadow-sm"
                        : "text-muted-foreground"
                )}
            >
                <item.icon className="h-5 w-5" />
                {item.label}
            </Link>
        )
    }

    return (
        <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="h-16 border-b flex items-center justify-center m-0 p-0">
                    <SheetTitle className="flex justify-center w-full mt-2">
                        <Logo size="sm" light={true} />
                    </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {mainItems.map(renderItem)}

                    {sections.map((section) => (
                        <div key={section} className="pt-3 space-y-1">
                            <div className="border-t border-border/50 mb-3" />
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 pb-1">
                                {section}
                            </p>
                            {sectionedItems.filter((i: any) => i.section === section).map(renderItem)}
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    )
}
