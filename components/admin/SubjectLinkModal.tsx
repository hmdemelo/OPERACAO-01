"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { logger } from "@/lib/logger"

type SubjectItem = {
    id: string
    name: string
    linked: boolean
}

interface SubjectLinkModalProps {
    studentId: string
    studentName: string
    open: boolean
    onClose: () => void
}

export function SubjectLinkModal({ studentId, studentName, open, onClose }: SubjectLinkModalProps) {
    const [subjects, setSubjects] = useState<SubjectItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (open) {
            fetchSubjects()
        }
    }, [open, studentId])

    const fetchSubjects = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/mentor/student-subjects/${studentId}`)
            if (res.ok) {
                const data = await res.json()
                setSubjects(data)
            }
        } catch (error) {
            logger.error("Failed to fetch subjects", error)
            toast.error("Erro ao carregar matérias")
        } finally {
            setIsLoading(false)
        }
    }

    const toggleSubject = (subjectId: string) => {
        setSubjects(prev =>
            prev.map(s => s.id === subjectId ? { ...s, linked: !s.linked } : s)
        )
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const linkedIds = subjects.filter(s => s.linked).map(s => s.id)
            const res = await fetch(`/api/mentor/student-subjects/${studentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subjectIds: linkedIds })
            })

            if (res.ok) {
                toast.success("Matérias atualizadas com sucesso!")
                onClose()
            } else {
                toast.error("Erro ao salvar matérias")
            }
        } catch (error) {
            logger.error("Failed to save subjects", error)
            toast.error("Erro ao salvar matérias")
        } finally {
            setIsSaving(false)
        }
    }

    const linkedCount = subjects.filter(s => s.linked).length

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        📚 Vincular Matérias
                    </DialogTitle>
                    <DialogDescription>
                        Selecione as matérias para <strong>{studentName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {isLoading ? (
                        <div className="text-center text-muted-foreground py-8">
                            Carregando matérias...
                        </div>
                    ) : subjects.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            Nenhuma matéria disponível. Vincule matérias ao seu perfil primeiro.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                            {subjects.map(subject => (
                                <label
                                    key={subject.id}
                                    className="flex items-center gap-3 p-2 rounded-md border cursor-pointer hover:bg-accent/50 transition-colors"
                                >
                                    <Checkbox
                                        checked={subject.linked}
                                        onCheckedChange={() => toggleSubject(subject.id)}
                                    />
                                    <span className="text-sm font-medium">{subject.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex items-center justify-between sm:justify-between">
                    <span className="text-xs text-muted-foreground">
                        {linkedCount} matéria{linkedCount !== 1 ? "s" : ""} selecionada{linkedCount !== 1 ? "s" : ""}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={isSaving}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving || subjects.length === 0}>
                            {isSaving ? "Salvando..." : "Salvar"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
