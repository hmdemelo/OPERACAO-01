"use client"

import { logger } from "@/lib/logger";
import { useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"

interface Concurso {
    id: string
    name: string
}

interface Subject {
    id: string
    name: string
}

export function LinksCard() {
    const { control } = useFormContext()
    const [concursos, setConcursos] = useState<Concurso[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                const [cRes, sRes] = await Promise.all([
                    fetch('/api/admin/concursos'),
                    fetch('/api/admin/subjects')
                ])
                if (cRes.ok && sRes.ok) {
                    const cData = await cRes.json()
                    const sData = await sRes.json()
                    setConcursos(cData)
                    setSubjects(sData)
                }
            } catch (err) {
                logger.error("Failed to fetch links data:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center p-6 border rounded-lg bg-card">
                <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vínculos</CardTitle>
                <CardDescription>Gerencie a quais concursos e matérias este usuário tem acesso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium mb-3">Concursos Vinculados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {concursos.map((item) => (
                            <FormField
                                key={item.id}
                                control={control}
                                name="concursoIds"
                                render={({ field }) => {
                                    return (
                                        <FormItem
                                            key={item.id}
                                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 bg-secondary/20"
                                        >
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item.id)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), item.id])
                                                            : field.onChange(
                                                                (field.value || []).filter(
                                                                    (value: string) => value !== item.id
                                                                )
                                                            )
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal text-sm cursor-pointer whitespace-normal break-words leading-tight">{item.name}</FormLabel>
                                        </FormItem>
                                    )
                                }}
                            />
                        ))}
                        {concursos.length === 0 && (
                            <p className="text-sm text-muted-foreground">Nenhum concurso cadastrado.</p>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium mb-3">Matérias Vinculadas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subjects.map((item) => (
                            <FormField
                                key={item.id}
                                control={control}
                                name="subjectIds"
                                render={({ field }) => {
                                    return (
                                        <FormItem
                                            key={item.id}
                                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 bg-secondary/20"
                                        >
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item.id)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), item.id])
                                                            : field.onChange(
                                                                (field.value || []).filter(
                                                                    (value: string) => value !== item.id
                                                                )
                                                            )
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal text-sm cursor-pointer whitespace-normal break-words leading-tight">{item.name}</FormLabel>
                                        </FormItem>
                                    )
                                }}
                            />
                        ))}
                        {subjects.length === 0 && (
                            <p className="text-sm text-muted-foreground">Nenhuma matéria cadastrada.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
