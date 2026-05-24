"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export function DangerZoneCard() {
    const [open, setOpen] = useState(false)
    const [password, setPassword] = useState("")
    const [acknowledged, setAcknowledged] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const canSubmit = password.length > 0 && acknowledged && !submitting

    const reset = () => {
        setPassword("")
        setAcknowledged(false)
        setSubmitting(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!canSubmit) return
        setSubmitting(true)
        try {
            const res = await fetch("/api/user/account", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            })
            if (!res.ok) {
                const message = await res.text()
                throw new Error(message || "Falha ao excluir conta")
            }
            toast.success("Conta excluída. Encerrando sessão...")
            await signOut({ callbackUrl: "/" })
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao excluir conta")
            setSubmitting(false)
        }
    }

    return (
        <div className="border border-destructive/30 rounded-lg bg-destructive/5 overflow-hidden mt-6">
            <div className="px-4 py-3 border-b border-destructive/20 bg-destructive/10 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <h3 className="text-sm font-semibold text-destructive">Zona de Perigo</h3>
            </div>
            <div className="p-4 space-y-3">
                <div>
                    <p className="text-sm font-medium">Excluir minha conta</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Em conformidade com o art. 18, VI da LGPD, você pode solicitar a exclusão definitiva da sua
                        conta. Esta ação é <strong>irreversível</strong> e remove permanentemente todos os seus dados.
                    </p>
                </div>

                <Dialog
                    open={open}
                    onOpenChange={(v) => {
                        setOpen(v)
                        if (!v) reset()
                    }}
                >
                    <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            Excluir minha conta
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-destructive">Excluir conta permanentemente</DialogTitle>
                            <DialogDescription className="text-left">
                                Esta ação é irreversível. Serão apagados:
                            </DialogDescription>
                        </DialogHeader>

                        <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                            <li>Seus logs de estudo e histórico de revisões</li>
                            <li>Sua grade de estudos (Fases 1, 2 e 3)</li>
                            <li>Suas respostas no banco de questões</li>
                            <li>Seu plano semanal</li>
                            <li>Seus simulados e anotações</li>
                            <li>Seu cadastro e dados pessoais</li>
                        </ul>

                        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="text-sm">
                                    Confirme sua senha
                                </Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={submitting}
                                    required
                                />
                            </div>

                            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={acknowledged}
                                    onChange={(e) => setAcknowledged(e.target.checked)}
                                    disabled={submitting}
                                    className="mt-0.5 accent-destructive"
                                />
                                <span>
                                    Entendo que esta ação é permanente e que meus dados não poderão ser recuperados.
                                </span>
                            </label>

                            <DialogFooter className="gap-2 sm:gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={submitting}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="destructive" disabled={!canSubmit}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirmar exclusão
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
