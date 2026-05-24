import Link from "next/link"
import { ChevronRight } from "lucide-react"

export interface Crumb {
    label: string
    href?: string
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
    return (
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
            {items.map((item, i) => {
                const isLast = i === items.length - 1
                return (
                    <span key={i} className="flex items-center gap-1.5">
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="hover:text-foreground transition-colors font-medium"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className={isLast ? "text-foreground font-semibold" : "font-medium"}>
                                {item.label}
                            </span>
                        )}
                        {!isLast && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                    </span>
                )
            })}
        </nav>
    )
}
