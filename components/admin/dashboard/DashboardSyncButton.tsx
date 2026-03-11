"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export function DashboardSyncButton() {
    const [isSyncing, setIsSyncing] = useState(false)
    const [isSynced, setIsSynced] = useState(false)
    const router = useRouter()

    const handleSync = async () => {
        if (isSyncing || isSynced) return;

        setIsSyncing(true)
        try {
            const res = await fetch("/api/admin/metrics/revalidate", {
                method: "POST",
            })

            if (res.ok) {
                toast.success("Dados sincronizados com sucesso! A tela será atualizada.")
                setIsSynced(true)

                // Force a hard navigation to fetch fresh data from the server
                router.refresh()

                // Cooldown: Bloqueia novo clique por 60 segundos para poupar o banco
                setTimeout(() => {
                    setIsSynced(false)
                }, 60000)
            } else {
                toast.error("Falha ao sincronizar dados.")
            }
        } catch (error) {
            toast.error("Erro de conexão ao sincronizar.")
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing || isSynced}
            className="flex items-center gap-2 h-[34px]"
            title="Sincronizar métricas agora (bypass cache temporário)"
        >
            {isSyncing ? (
                <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground hidden sm:inline">Atualizando...</span>
                </>
            ) : isSynced ? (
                <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500 font-medium hidden sm:inline">Sincronizado</span>
                </>
            ) : (
                <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Sincronizar Agora</span>
                </>
            )}
        </Button>
    )
}
