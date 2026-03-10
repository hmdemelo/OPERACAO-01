"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Settings, Bug, Plus, Loader2 } from "lucide-react"

export function ChangelogForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        version: "",
        title: "",
        content: "",
        category: "NEW"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/admin/changelog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setFormData({ version: "", title: "", content: "", category: "NEW" })
                router.refresh()
            }
        } catch (error) {
            console.error("Error creating changelog:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Publicar Nova Atualização
                </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="version">Versão</Label>
                            <Input
                                id="version"
                                placeholder="ex: v1.4.0"
                                value={formData.version}
                                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(val) => setFormData({ ...formData, category: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NEW">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-primary" /> Novidade
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="IMPROVEMENT">
                                        <div className="flex items-center gap-2">
                                            <Settings className="h-4 w-4 text-blue-500" /> Melhoria
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="FIX">
                                        <div className="flex items-center gap-2">
                                            <Bug className="h-4 w-4 text-orange-500" /> Correção
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Título da Seção</Label>
                        <Input
                            id="title"
                            placeholder="ex: Painel Administrador"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Conteúdo (Markdown)</Label>
                        <Textarea
                            id="content"
                            placeholder="- **Recurso X** — Descrição detalhada"
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Publicando...
                            </>
                        ) : (
                            "Publicar no Mural"
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
