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
}

export function MobileSidebar({ role }: MobileSidebarProps) {
    const pathname = usePathname()
    const { isMobileOpen, setMobileOpen } = useSidebar()
    const items =
        role === "ADMIN" ? adminItems :
            role === "MENTOR" ? mentorItems :
                studentItems

    return (
        <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="h-16 border-b flex items-center justify-center m-0 p-0">
                    <SheetTitle className="flex justify-center w-full mt-2">
                        <Logo size="sm" light={true} />
                    </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={(item as any).prefetch}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                                pathname === item.href
                                    ? "bg-secondary text-secondary-foreground shadow-sm"
                                    : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    )
}
