"use client"

import { useState } from "react"
import { Download, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function PrivacyCard() {
    const [downloading, setDownloading] = useState(false)

    const handleExport = async () => {
        setDownloading(true)
        try {
            const res = await fetch("/api/user/export")
            if (!res.ok) throw new Error("Falha ao gerar exportação")

            const blob = await res.blob()
            const filename =
                res.headers
                    .get("content-disposition")
                    ?.match(/filename="([^"]+)"/)?.[1] ?? "meus-dados.json"

            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)

            toast.success("Download iniciado")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao exportar")
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="border rounded-lg bg-card overflow-hidden mt-6">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Privacidade e Dados</h3>
            </div>
            <div className="p-4 space-y-3">
                <div>
                    <p className="text-sm font-medium">Exportar meus dados</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Em conformidade com o art. 18, V da LGPD (direito à portabilidade), você pode baixar um
                        arquivo JSON com todos os seus dados pessoais armazenados na plataforma.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={downloading}
                >
                    {downloading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    Baixar meus dados (JSON)
                </Button>
            </div>
        </div>
    )
}
