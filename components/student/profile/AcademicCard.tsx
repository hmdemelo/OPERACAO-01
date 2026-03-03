"use client"

logger.info("ACADEMIC CARD LOADED") // Corrected log message too

import { logger } from "@/lib/logger";
import { useFormContext } from "react-hook-form"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Target, Clock, GraduationCap } from "lucide-react"
import { ProfileFormValues } from "./profile-schema"

export function AcademicCard() {
    const form = useFormContext<ProfileFormValues>()

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Foco & Metas
                </CardTitle>
                <CardDescription>
                    Configure seus objetivos para o plano de estudos personalizado.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="educationLevel"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-foreground/70">Escolaridade</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value || undefined}
                                    value={field.value || undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger className="bg-card/50">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                                <SelectValue placeholder="Selecione..." />
                                            </div>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Ensino Médio Incompleto">Ensino Médio Incompleto</SelectItem>
                                        <SelectItem value="Ensino Médio Completo">Ensino Médio Completo</SelectItem>
                                        <SelectItem value="Superior Incompleto">Superior Incompleto</SelectItem>
                                        <SelectItem value="Superior Completo">Superior Completo</SelectItem>
                                        <SelectItem value="Pós-Graduação">Pós-Graduação</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dailyHours"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-foreground/70">Horas Disponíveis / Dia</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            min="0"
                                            max="24"
                                            placeholder="Ex: 4"
                                            className="pl-9 bg-card/50"
                                            {...field}
                                            value={field.value ?? 0}
                                            onChange={e => {
                                                const val = e.target.valueAsNumber;
                                                field.onChange(isNaN(val) ? 0 : val);
                                            }}
                                        />
                                    </div>
                                </FormControl>
                                <FormDescription className="text-[11px]">
                                    Isso ajuda a calcular sua meta semanal.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
