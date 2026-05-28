"use client"



import { logger } from "@/lib/logger";
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { profileFormSchema, ProfileFormValues } from "./profile/profile-schema"
import { dbToForm } from "./profile/profile-mapper"

import { AccountCard } from "./profile/AccountCard"
import { PersonalDataCard } from "./profile/PersonalDataCard"
import { LinksCard } from "./profile/LinksCard"
import { PreferencesCard } from "./PreferencesCard"
import { PrivacyCard } from "./PrivacyCard"
import { DangerZoneCard } from "./DangerZoneCard"

interface ProfileFormProps {
    initialData: any
    actionUrl?: string
    onSuccessRedirect?: string
    isAdmin?: boolean
    isNew?: boolean
    hideFooter?: boolean
    mentors?: { id: string; name: string | null; email?: string | null }[]
}

export function ProfileForm({
    initialData,
    actionUrl = "/api/user/profile",
    onSuccessRedirect,
    isAdmin = false,
    isNew = false,
    hideFooter = false,
    mentors = []
}: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema) as any,
        defaultValues: dbToForm(initialData),
        mode: "onChange",
    })

    // Reset loop
    useEffect(() => {
        if (initialData) {
            const mapped = dbToForm(initialData);
            form.reset(mapped, { keepDirty: false });
        }
    }, [initialData, form]);

    async function onSubmit(data: ProfileFormValues) {
        setIsLoading(true)
        logger.info("Submitting Profile:", data);

        try {
            const response = await fetch(actionUrl, {
                method: isNew ? "POST" : "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json();
                logger.error("Profile update failed:", errorData);
                throw new Error(errorData.error || "Erro ao atualizar perfil")
            }

            const updatedUser = await response.json();
            logger.info("Profile updated successfully:", updatedUser);

            toast.success(isNew ? "Usuário criado com sucesso!" : "Perfil atualizado com sucesso!")

            const redirect = isNew && updatedUser.appVersion === "v2" && updatedUser.role === "STUDENT"
                ? `/admin/v2/students`
                : onSuccessRedirect

            if (redirect) {
                setTimeout(() => {
                    router.push(redirect)
                    router.refresh()
                }, 800)
            } else {
                router.refresh()
            }

        } catch (error) {
            logger.error(error)
            toast.error("Erro ao salvar alterações.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form
                id="profile-form"
                onSubmit={form.handleSubmit(onSubmit as any, (errors) => {
                    logger.error("Form validation errors:", errors);
                    toast.error("Existem campos inválidos ou obrigatórios não preenchidos. Verifique todas as abas.");
                })}
            >
                <div className="container mx-auto px-4 py-4">
                    <Tabs defaultValue="account" className="flex flex-col md:flex-row gap-6 items-start">
                        <aside className="w-full md:w-64 shrink-0">
                            <div className="space-y-1">
                                <h2 className="text-sm font-semibold text-muted-foreground px-3 mb-2 uppercase tracking-wider">
                                    Navegação
                                </h2>
                                <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1 border-none justify-start items-stretch">
                                    <TabsTrigger
                                        value="account"
                                        className="justify-start px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 transition-all rounded-lg"
                                    >
                                        Conta e Acesso
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="personal"
                                        className="justify-start px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 transition-all rounded-lg"
                                    >
                                        Dados Pessoais
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="academic"
                                        className="justify-start px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 transition-all rounded-lg"
                                    >
                                        Acadêmico
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </aside>

                        <div className="flex-1 w-full max-w-5xl">
                            <TabsContent value="account" className="mt-0 focus-visible:outline-none outline-none">
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <AccountCard isAdmin={isAdmin} isNew={isNew} mentors={mentors} />
                                </div>
                            </TabsContent>

                            <TabsContent value="personal" className="mt-0 focus-visible:outline-none outline-none">
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <PersonalDataCard />
                                </div>
                            </TabsContent>

                            <TabsContent value="academic" className="mt-0 focus-visible:outline-none outline-none">
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-6">
                                    {isAdmin && <LinksCard />}
                                    {!isAdmin && !isNew && <PreferencesCard />}
                                    {!isAdmin && !isNew && <PrivacyCard />}
                                    {!isAdmin && !isNew && <DangerZoneCard />}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </form>

            {!hideFooter && <div className="border-t bg-background/80 backdrop-blur-md py-3">
                <div className="container mx-auto px-4 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(onSuccessRedirect || "/admin/users")}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form="profile-form"
                        size="lg"
                        disabled={isLoading}
                        className="px-8 shadow-lg shadow-primary/20"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isNew ? "Criar Usuário" : "Salvar Alterações"}
                    </Button>
                </div>
            </div>}
        </Form>
    )
}
