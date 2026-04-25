"use client"

import { useState, useRef } from "react"
import { Upload, Loader2, X, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

type ImportResult = {
    imported: number
    failed: number
    errors: { line: number; message: string }[]
    warnings?: {
        unmatchedSubjects: number
        unmatchedContents: number
    }
}

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function BulkUploadDialog({ open, onOpenChange, onSuccess }: Props) {
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [result, setResult] = useState<ImportResult | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const reset = () => {
        setFile(null)
        setResult(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleClose = () => {
        if (isUploading) return
        onOpenChange(false)
        reset()
    }

    const handleUpload = async () => {
        if (!file) return
        setIsUploading(true)
        setResult(null)
        try {
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch("/api/admin/questions/bulk-upload", {
                method: "POST",
                body: formData,
            })
            const data = await res.json()

            if (!res.ok && data.imported === undefined) {
                throw new Error(data.error || "Falha ao importar")
            }

            setResult(data)

            if (data.imported > 0) {
                toast.success(`${data.imported} questões importadas como pendentes`)
                onSuccess?.()
            } else {
                toast.error("Nenhuma questão foi importada")
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao importar"
            toast.error(msg)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" /> Importar Questões em Lote
                    </DialogTitle>
                    <DialogDescription>
                        Envie um arquivo CSV ou JSON com várias questões. Todas entrarão como pendentes para revisão.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="border rounded-lg p-3 bg-muted/30 text-xs space-y-2">
                        <p className="font-medium text-sm">Formato esperado (CSV)</p>
                        <p className="text-muted-foreground">
                            Separador <code className="px-1 py-0.5 rounded bg-muted">;</code> (ponto e vírgula).
                            Colunas: <code className="px-1 py-0.5 rounded bg-muted">stem;alt_a;alt_b;alt_c;alt_d;alt_e;correct;subject;content;source;year;commentary</code>
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                            <li><strong>Obrigatórios:</strong> stem, alt_a, alt_b, alt_c</li>
                            <li><strong>Opcionais:</strong> alt_d, alt_e, correct (A-E), subject, content, source, year, commentary</li>
                            <li>Matérias e conteúdos não cadastrados ficam vinculo nulo — mentor corrige na revisão</li>
                            <li>Limite: 500 questões por arquivo</li>
                        </ul>
                        <a
                            href="/api/admin/questions/template"
                            download
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                            <Download className="h-3 w-3" /> Baixar template CSV
                        </a>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs">Arquivo (.csv ou .json, máx. 5MB)</Label>
                        {!file ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors"
                            >
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Clique para selecionar</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">CSV ou JSON</p>
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 border rounded-lg p-3 bg-muted/30">
                                <FileSpreadsheet className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFile(null)}
                                    disabled={isUploading}
                                    className="p-1 hover:bg-muted rounded flex-shrink-0"
                                    aria-label="Remover arquivo"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.json,text/csv,application/json"
                            onChange={(e) => {
                                setFile(e.target.files?.[0] || null)
                                setResult(null)
                            }}
                            className="hidden"
                        />
                    </div>

                    {result && (
                        <div className="space-y-2">
                            {result.imported > 0 && (
                                <div className="border border-green-500/30 bg-green-500/5 rounded-lg p-3 flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                                    <div className="text-green-700 dark:text-green-400">
                                        <p className="font-medium">{result.imported} questões importadas como pendentes</p>
                                        {result.warnings && (result.warnings.unmatchedSubjects > 0 || result.warnings.unmatchedContents > 0) && (
                                            <p className="text-xs mt-1 opacity-80">
                                                {result.warnings.unmatchedSubjects > 0 && `${result.warnings.unmatchedSubjects} sem matéria vinculada. `}
                                                {result.warnings.unmatchedContents > 0 && `${result.warnings.unmatchedContents} sem conteúdo vinculado. `}
                                                Vincule manualmente na revisão.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {result.errors.length > 0 && (
                                <div className="border border-red-500/30 bg-red-500/5 rounded-lg p-3 text-sm">
                                    <div className="flex items-start gap-2 text-red-700 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="font-medium">{result.failed} {result.failed === 1 ? "linha rejeitada" : "linhas rejeitadas"}</p>
                                            <ul className="text-xs mt-1.5 space-y-0.5 opacity-80 max-h-40 overflow-y-auto">
                                                {result.errors.slice(0, 50).map((e, i) => (
                                                    <li key={i}>{e.message}</li>
                                                ))}
                                                {result.errors.length > 50 && (
                                                    <li className="font-medium">... e mais {result.errors.length - 50} {result.errors.length - 50 === 1 ? "erro" : "erros"}</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                            {result?.imported ? "Fechar" : "Cancelar"}
                        </Button>
                        {!result?.imported && (
                            <Button onClick={handleUpload} disabled={!file || isUploading} className="gap-2">
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Importando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        Importar
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
