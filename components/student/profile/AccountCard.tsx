"use client"



import { useFormContext } from "react-hook-form"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Button
} from "@/components/ui/button"
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
import { User, Mail, KeyRound, Pencil, Check, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfileFormValues } from "./profile-schema"
import { useState } from "react"

interface AccountCardProps {
    isAdmin?: boolean
    isNew?: boolean
    mentors?: { id: string; name: string | null; email?: string | null }[]
}

export function AccountCard({ isAdmin, isNew, mentors = [] }: AccountCardProps) {
    const form = useFormContext<ProfileFormValues>()
    const [isEditingEmail, setIsEditingEmail] = useState(false)
    const [tempEmail, setTempEmail] = useState(form.getValues("email"))

    const startEditingEmail = () => {
        setTempEmail(form.getValues("email"))
        setIsEditingEmail(true)
    }

    const cancelEditingEmail = () => {
        setIsEditingEmail(false)
    }

    const confirmEditingEmail = () => {
        form.setValue("email", tempEmail, { shouldDirty: true, shouldValidate: true })
        setIsEditingEmail(false)
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <div className="flex flex-col md:flex-row gap-6 items-start mb-8 pb-8 border-b">
                <Avatar className="h-28 w-28 border-4 border-background shadow-xl shrink-0">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${form.watch("name")}`} />
                    <AvatarFallback className="text-2xl">U</AvatarFallback>
                </Avatar>
                <div className="space-y-1 pt-2">
                    <h3 className="text-2xl font-bold tracking-tight">{form.watch("name") || "Novo Usuário"}</h3>
                    <p className="text-muted-foreground">{form.watch("email") || "cadastro@exemplo.com"}</p>
                    <div className="flex gap-2 mt-2">
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {{ STUDENT: "ALUNO", ADMIN: "ADMINISTRADOR", MENTOR: "MENTOR" }[form.watch("role") || "STUDENT"]}
                        </span>
                        {form.watch("active") ? (
                            <span className="bg-green-500/10 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Ativo</span>
                        ) : (
                            <span className="bg-red-500/10 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Inativo</span>
                        )}
                    </div>
                </div>
            </div>

            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg flex items-center gap-2">
                    Configurações de Acesso
                </CardTitle>
                <CardDescription>
                    Gerencie as credenciais e permissões fundamentais da conta.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-foreground/70">Nome Completo</FormLabel>
                                <FormControl>
                                    <Input placeholder="Seu nome" className="bg-card/50" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-foreground/70">E-mail (Login)</FormLabel>
                                <FormControl>
                                    <div className="relative flex gap-2">
                                        <div className="relative flex-1">
                                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-9 bg-card/50"
                                                {...(isEditingEmail ? {
                                                    value: tempEmail,
                                                    onChange: (e) => setTempEmail(e.target.value)
                                                } : field)}
                                                disabled={!isNew && !isEditingEmail}
                                            />
                                        </div>
                                        {isAdmin && !isNew && (
                                            <div className="flex shrink-0">
                                                {!isEditingEmail ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-10 w-10 border-dashed hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
                                                        onClick={startEditingEmail}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <div className="flex gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="default"
                                                            size="icon"
                                                            className="h-10 w-10 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                                            onClick={confirmEditingEmail}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-10 w-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            onClick={cancelEditingEmail}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormDescription className="text-[11px]">
                                    O e-mail é usado para login e comunicações oficiais.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {isNew && (
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground/70">Senha Temporária</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input className="pl-9 bg-card/50" type="password" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {isAdmin && (
                        <>
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground/70">Nível de Acesso</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                                            <FormControl>
                                                <SelectTrigger className="bg-card/50">
                                                    <SelectValue placeholder="Selecione a função" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="STUDENT">Aluno (Padrão)</SelectItem>
                                                <SelectItem value="MENTOR">Mentor (Parcial)</SelectItem>
                                                <SelectItem value="ADMIN">Administrador (Total)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground/70">Estado da Conta</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(val === "true")}
                                            defaultValue={field.value ? "true" : "false"}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-card/50">
                                                    <SelectValue placeholder="Selecione o status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="true">Permitir Acesso (Ativo)</SelectItem>
                                                <SelectItem value="false">Bloquear Acesso (Inativo)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {form.watch("role") === "STUDENT" && (
                                <FormField
                                    control={form.control}
                                    name="mentorId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground/70">Mentor Responsável</FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                                                value={field.value || "none"}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="bg-card/50">
                                                        <SelectValue placeholder="Selecione um mentor" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">Sem Mentor</SelectItem>
                                                    {mentors.map(m => (
                                                        <SelectItem key={m.id} value={m.id}>{m.name || m.email || m.id}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription className="text-[11px]">
                                                O mentor selecionado terá acesso aos dados deste aluno (Apenas para Alunos).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
