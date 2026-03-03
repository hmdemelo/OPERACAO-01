"use client"

logger.info("PERSONAL DATA CARD LOADED") // Corrected log message too

import { logger } from "@/lib/logger";
import { useFormContext } from "react-hook-form"
import { useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Smartphone, MapPin, Calendar } from "lucide-react"
import { ProfileFormValues } from "./profile-schema"

export function PersonalDataCard() {
    const form = useFormContext<ProfileFormValues>()

    // Local state for the masked input value
    const [dateValue, setDateValue] = useState(() => {
        const initial = form.getValues("birthDate")
        if (!initial) return ""
        // Convert YYYY-MM-DD to DD/MM/YYYY
        const parts = initial.split("-")
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : ""
    })

    const applyDateMask = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 8)
        let masked = digits
        if (digits.length > 2) masked = `${digits.slice(0, 2)}/${digits.slice(2)}`
        if (digits.length > 4) masked = `${masked.slice(0, 5)}/${digits.slice(4)}`
        return masked
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
        const maskedValue = applyDateMask(e.target.value)
        setDateValue(maskedValue)

        if (maskedValue.length === 10) {
            const [day, month, year] = maskedValue.split("/").map(Number)
            // Basic validation
            const date = new Date(year, month - 1, day)
            const isValid =
                date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day &&
                year > 1900 &&
                year < 2100

            if (isValid) {
                const isoValue = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                onChange(isoValue)
            } else {
                onChange("") // Trigger validation error
            }
        } else {
            onChange("")
        }
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    Dados Pessoais
                </CardTitle>
                <CardDescription>
                    Informações de contato e identificação civil.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="cpf"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-foreground/70">CPF</FormLabel>
                                <FormControl>
                                    <Input placeholder="000.000.000-00" className="bg-card/50" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-foreground/70">Telefone / WhatsApp</FormLabel>
                                <FormControl>
                                    <Input placeholder="(00) 00000-0000" className="bg-card/50" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-foreground/70">Data de Nascimento</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            placeholder="DD/MM/AAAA"
                                            className="pl-9 bg-card/50"
                                            value={dateValue}
                                            onChange={(e) => handleDateChange(e, field.onChange)}
                                            maxLength={10}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-dashed">
                    <FormField
                        control={form.control}
                        name="addressCity"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel className="text-foreground/70">Cidade</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9 bg-card/50" placeholder="Sua cidade" {...field} value={field.value || ""} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="addressState"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-foreground/70">Estado (UF)</FormLabel>
                                <FormControl>
                                    <Input placeholder="UF" maxLength={2} className="bg-card/50 uppercase" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
