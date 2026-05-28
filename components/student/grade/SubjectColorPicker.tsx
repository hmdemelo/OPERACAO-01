'use client'

import { useEffect, useRef, useState } from "react"
import { categoryPalette } from "@/lib/dashboard/visualTokens"

interface Props {
    subjectId: string
    currentColor: string
    label: string
    onChange: (color: string) => void
}

/**
 * Compact swatch picker. Renders a single colored dot trigger; on click,
 * pops a row of 10 swatches below it. Selection fires onChange + closes.
 *
 * Positioning: the popover is absolute and follows the trigger via portal-free
 * relative+absolute. Picker is meant to be embedded inline next to a legend
 * item or pie slice label.
 */
export function SubjectColorPicker({ subjectId, currentColor, label, onChange }: Props) {
    const [open, setOpen] = useState(false)
    const [busy, setBusy] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        function onDocClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false)
        }
        document.addEventListener("mousedown", onDocClick)
        document.addEventListener("keydown", onKey)
        return () => {
            document.removeEventListener("mousedown", onDocClick)
            document.removeEventListener("keydown", onKey)
        }
    }, [open])

    async function pick(color: string) {
        if (color === currentColor) {
            setOpen(false)
            return
        }
        setBusy(true)
        try {
            const res = await fetch("/api/student/subject-colors", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subjectV2Id: subjectId, color }),
            })
            if (!res.ok) throw new Error("Falha ao salvar cor")
            onChange(color)
            setOpen(false)
        } catch {
            // silencioso por enquanto — fica com a cor anterior
        } finally {
            setBusy(false)
        }
    }

    return (
        <div ref={ref} className="relative inline-flex">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                disabled={busy}
                aria-label={`Mudar cor de ${label}`}
                className="h-3.5 w-3.5 rounded-full border border-background/40 shadow-sm transition-transform hover:scale-125 disabled:opacity-50"
                style={{ background: currentColor }}
            />
            {open && (
                <div
                    role="dialog"
                    className="absolute left-1/2 top-full z-30 mt-1.5 -translate-x-1/2 rounded-md border border-border bg-popover p-1.5 shadow-lg"
                >
                    <div className="flex gap-1">
                        {categoryPalette.map(c => {
                            const selected = c === currentColor
                            return (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => pick(c)}
                                    aria-label={c}
                                    className={`h-5 w-5 rounded-full border transition-transform hover:scale-110 ${selected ? "border-foreground ring-1 ring-foreground/40" : "border-background/40"}`}
                                    style={{ background: c }}
                                />
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
