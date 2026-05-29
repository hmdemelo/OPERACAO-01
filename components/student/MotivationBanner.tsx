"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

export function MotivationBanner() {
    const [message, setMessage] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        fetch("/api/student/motivation")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (active && data?.message) setMessage(data.message)
            })
            .catch(() => {})
        return () => {
            active = false
        }
    }, [])

    if (!message) return null

    return (
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-foreground/90">{message}</p>
        </div>
    )
}
