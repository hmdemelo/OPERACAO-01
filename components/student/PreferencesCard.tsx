"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Settings, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function PreferencesCard() {
    const queryClient = useQueryClient()
    const [showAnswered, setShowAnswered] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        let cancelled = false
        fetch("/api/user/preferences")
            .then((r) => r.json())
            .then((d) => {
                if (cancelled) return
                setShowAnswered(!!d.showAnsweredQuestions)
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [])

    const handleToggle = async (next: boolean) => {
        setIsSaving(true)
        const previous = showAnswered
        setShowAnswered(next)
        try {
            const res = await fetch("/api/user/preferences", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ showAnsweredQuestions: next }),
            })
            if (!res.ok) throw new Error("Falha ao salvar")
            queryClient.invalidateQueries({ queryKey: ["studentQuestions"] })
            toast.success("Preferência atualizada")
        } catch (err) {
            setShowAnswered(previous)
            toast.error(err instanceof Error ? err.message : "Erro ao salvar")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="border rounded-lg bg-card overflow-hidden mt-6">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Preferências</h3>
            </div>
            <div className="p-4">
                {isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
                    </div>
                ) : (
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <Label htmlFor="show-answered" className="text-sm font-medium">
                                Exibir questões respondidas
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Quando ativo, as questões marcadas como respondidas voltam a aparecer no Banco de Questões da Semana.
                            </p>
                        </div>
                        <Switch
                            id="show-answered"
                            checked={showAnswered}
                            onCheckedChange={handleToggle}
                            disabled={isSaving}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
