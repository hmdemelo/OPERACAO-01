"use client"

import { useState, useRef } from "react"
import { Plus, Upload, Loader2, X, FileText, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

export function QuestionUploadFAB() {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [source, setSource] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const reset = () => {
        setFile(null)
        setSource("")
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleClose = () => {
        if (isUploading) return
        setOpen(false)
        reset()
    }

    const handleUpload = async () => {
        if (!file) return
        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            if (source.trim()) formData.append("source", source.trim())

            const res = await fetch("/api/questions/upload", {
                method: "POST",
                body: formData,
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Falha no upload")

            toast.success(`Questão enviada para revisão! #${data.externalCode}`)
            setOpen(false)
            reset()
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao enviar questão"
            toast.error(msg)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                aria-label="Enviar nova questão"
                className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-110 flex items-center justify-center"
            >
                <Plus className="h-6 w-6" />
            </button>

            <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Upload className="h-4 w-4" /> Enviar Questão
                        </DialogTitle>
                        <DialogDescription>
                            Faça upload de uma imagem ou PDF.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Arquivo (imagem ou PDF, máx. 10MB)</Label>
                            {!file ? (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors"
                                >
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Clique para selecionar</p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">JPG, PNG, WEBP ou PDF</p>
                                </button>
                            ) : (
                                <div className="flex items-center gap-3 border rounded-lg p-3 bg-muted/30">
                                    {file.type === "application/pdf" ? (
                                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                    ) : (
                                        <ImageIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                    )}
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
                                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Fonte (opcional)</Label>
                            <Input
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                placeholder="Ex: ENEM 2023, OAB 2024"
                                disabled={isUploading}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={isUploading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                                className="gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Analisando com IA...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        Analisar e Enviar
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
