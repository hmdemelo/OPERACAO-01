"use client"

import { logger } from "@/lib/logger";
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, ArrowUp, ArrowDown, ExternalLink, Settings, Layout, Users, Megaphone } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// ... imports kept same ...

// --- Featured Student Types & Schema ---
type FeaturedStudent = {
    id: string
    name: string
    role: string
    imageUrl: string
    quote: string
    active: boolean
    order: number
}

const studentSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    role: z.string().min(2, "Função obrigatória"),
    quote: z.string().min(5, "Depoimento obrigatório"),
    imageUrl: z.string().min(1, "Imagem é obrigatória"),
    active: z.boolean().optional(),
})

// --- Plan Types & Schema ---
type Plan = {
    id: string
    title: string
    description?: string
    price: number
    oldPrice?: number
    installments?: string
    features: string[]
    whatsappMessage?: string
    highlighted: boolean
    active: boolean
    order: number
}

const planSchema = z.object({
    title: z.string().min(1, "Título obrigatório"),
    description: z.string().optional(),
    price: z.string().min(1, "Preço é obrigatório"), // Changed to string for form handling
    oldPrice: z.string().optional(), // Changed to string
    installments: z.string().optional(),
    features: z.string().min(1, "Adicione beneficios separados por quebra de linha"),
    whatsappMessage: z.string().optional(),
    highlighted: z.boolean().optional(),
    active: z.boolean().optional(),
})

// --- Method Item Types & Schema ---
type MethodItem = {
    id: string
    step: string
    title: string
    description: string
    icon: string
    order: number
    active: boolean
}

const methodSchema = z.object({
    step: z.string().min(1, "Passo obrigatório (ex: 01)"),
    title: z.string().min(1, "Título obrigatório"),
    description: z.string().min(1, "Descrição obrigatória"),
    icon: z.string().min(1, "Ícone obrigatório"),
    active: z.boolean().optional(),
})

// --- Landing Settings Schema ---
const settingsSchema = z.object({
    landing_hero_title: z.string().min(1, "Título é obrigatório"),
    landing_hero_subtitle: z.string().min(1, "Subtítulo é obrigatório"),
    landing_hero_video_url: z.string().optional(),
    landing_cta_title: z.string().min(1, "Título do CTA é obrigatório"),
    landing_cta_button_text: z.string().min(1, "Texto do botão é obrigatório"),
    contact_whatsapp_number: z.string().min(10, "Número inválido"),
    contact_whatsapp_message: z.string().min(1, "Mensagem é obrigatória"),
    social_instagram_url: z.string().url("Link inválido").optional().or(z.literal("")),
    social_youtube_url: z.string().url("Link inválido").optional().or(z.literal("")),
    marketing_fb_pixel_id: z.string().optional(),
    marketing_google_tag_manager_id: z.string().optional(),
})

const AVAILABLE_ICONS = [
    "Compass", "PenTool", "Target", "Trophy", "Zap", "Map", "Shield", "Sword", "Crosshair", "Flag", "BookOpen", "Brain", "Activity"
]

export default function AdminLandingPage() {
    // --- Students State ---
    const [students, setStudents] = useState<FeaturedStudent[]>([])
    const [isUniqueLoading, setIsUniqueLoading] = useState(true)
    const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false)
    const [editingStudent, setEditingStudent] = useState<FeaturedStudent | null>(null)

    // --- Plans State ---
    const [plans, setPlans] = useState<Plan[]>([])
    const [isPlansLoading, setIsPlansLoading] = useState(true)
    const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

    // --- Method Method State ---
    const [methodItems, setMethodItems] = useState<MethodItem[]>([])
    const [isMethodLoading, setIsMethodLoading] = useState(true)
    const [isCreateMethodOpen, setIsCreateMethodOpen] = useState(false)
    const [editingMethod, setEditingMethod] = useState<MethodItem | null>(null)

    // --- Student Form ---
    const studentForm = useForm<z.infer<typeof studentSchema>>({
        resolver: zodResolver(studentSchema),
        defaultValues: { active: true }
    })

    // --- Plan Form ---
    const planForm = useForm<z.infer<typeof planSchema>>({
        resolver: zodResolver(planSchema),
        defaultValues: { active: true, highlighted: false }
    })

    // --- Method Form ---
    const methodForm = useForm<z.infer<typeof methodSchema>>({
        resolver: zodResolver(methodSchema),
        defaultValues: { active: true }
    })

    // --- Settings Form ---
    const settingsForm = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema)
    })

    const [isSettingsLoading, setIsSettingsLoading] = useState(false)

    // --- Fetchers ---
    const fetchStudents = async () => {
        setIsUniqueLoading(true)
        try {
            const res = await fetch("/api/admin/featured")
            if (res.ok) setStudents(await res.json())
        } catch (error) { logger.error(error) }
        finally { setIsUniqueLoading(false) }
    }

    const fetchPlans = async () => {
        setIsPlansLoading(true)
        try {
            const res = await fetch("/api/admin/landing/plans")
            if (res.ok) setPlans(await res.json())
        } catch (error) { logger.error(error) }
        finally { setIsPlansLoading(false) }
    }

    const fetchMethodItems = async () => {
        setIsMethodLoading(true)
        try {
            const res = await fetch("/api/admin/method")
            if (res.ok) setMethodItems(await res.json())
        } catch (error) { logger.error(error) }
        finally { setIsMethodLoading(false) }
    }

    const fetchSettings = async () => {
        setIsSettingsLoading(true)
        try {
            const res = await fetch("/api/admin/landing/settings")
            if (res.ok) {
                const data = await res.json()
                Object.entries(data).forEach(([key, value]) => {
                    settingsForm.setValue(key as any, value as string)
                })
            }
        } catch (error) { logger.error(error) }
        finally { setIsSettingsLoading(false) }
    }

    useEffect(() => {
        fetchStudents()
        fetchPlans()
        fetchMethodItems()
        fetchSettings()
    }, [])

    const onUpdateSettings = async (data: z.infer<typeof settingsSchema>) => {
        try {
            const res = await fetch("/api/admin/landing/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Falha ao atualizar")
            toast.success("Configurações atualizadas!")
        } catch (error) {
            toast.error("Erro ao salvar configurações")
        }
    }

    // --- Student Handlers (kept same logic, renamed variables) ---
    const onCreateStudent = async (data: z.infer<typeof studentSchema>) => {
        try {
            const res = await fetch("/api/admin/featured", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Falha ao criar")
            await fetchStudents()
            setIsCreateStudentOpen(false)
            studentForm.reset()
            toast.success("Salvo com sucesso!")
        } catch (error) { toast.error("Erro ao criar destaque") }
    }

    const onUpdateStudent = async (data: z.infer<typeof studentSchema>) => {
        if (!editingStudent) return
        try {
            const res = await fetch(`/api/admin/featured/${editingStudent.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Falha ao atualizar")
            await fetchStudents()
            setEditingStudent(null)
            studentForm.reset()
            toast.success("Salvo com sucesso!")
        } catch (error) { toast.error("Erro ao atualizar destaque") }
    }

    const startEditStudent = (student: FeaturedStudent) => {
        setEditingStudent(student)
        studentForm.setValue("name", student.name)
        studentForm.setValue("role", student.role)
        studentForm.setValue("quote", student.quote)
        studentForm.setValue("imageUrl", student.imageUrl)
        studentForm.setValue("active", student.active)
    }

    const onDeleteStudent = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja remover ${name}?`)) return
        try {
            await fetch(`/api/admin/featured/${id}`, { method: "DELETE" })
            await fetchStudents()
            toast.success("Excluído com sucesso!")
        } catch (error) { toast.error("Erro ao excluir") }
    }

    const moveStudentOrder = async (index: number, direction: 'up' | 'down') => {
        // ... (kept same logic as before) ...
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === students.length - 1) return

        const newStudents = [...students]
        const targetIndex = direction === 'up' ? index - 1 : index + 1

        const temp = newStudents[index]
        newStudents[index] = newStudents[targetIndex]
        newStudents[targetIndex] = temp

        const tempOrder = newStudents[index].order
        newStudents[index].order = newStudents[targetIndex].order
        newStudents[targetIndex].order = tempOrder

        setStudents(newStudents)

        try {
            await fetch("/api/admin/featured/reorder", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify([
                    { id: newStudents[index].id, order: newStudents[index].order },
                    { id: newStudents[targetIndex].id, order: newStudents[targetIndex].order }
                ])
            })
        } catch (error) {
            logger.error("Failed to sync order", error)
            await fetchStudents()
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "imageUrl") => {
        const file = e.target.files?.[0]
        if (!file) return
        const formData = new FormData()
        formData.append("file", file)
        try {
            const res = await fetch("/api/admin/featured/upload", { method: "POST", body: formData })
            if (!res.ok) throw new Error("Upload falhou")
            const data = await res.json()
            studentForm.setValue(fieldName, data.url)
            toast.success("Imagem enviada!")
        } catch (error) { toast.error("Erro ao enviar imagem") }
    }

    // --- Method Handlers ---
    const onCreateMethod = async (data: z.infer<typeof methodSchema>) => {
        try {
            const res = await fetch("/api/admin/method", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Falha ao criar")
            await fetchMethodItems()
            setIsCreateMethodOpen(false)
            methodForm.reset()
            toast.success("Salvo com sucesso!")
        } catch (error) { toast.error("Erro ao criar item do método") }
    }

    const onUpdateMethod = async (data: z.infer<typeof methodSchema>) => {
        if (!editingMethod) return
        try {
            const res = await fetch(`/api/admin/method/${editingMethod.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Falha ao atualizar")
            await fetchMethodItems()
            setEditingMethod(null)
            methodForm.reset()
            toast.success("Salvo com sucesso!")
        } catch (error) { toast.error("Erro ao atualizar item do método") }
    }

    const startEditMethod = (item: MethodItem) => {
        setEditingMethod(item)
        methodForm.setValue("step", item.step)
        methodForm.setValue("title", item.title)
        methodForm.setValue("description", item.description)
        methodForm.setValue("icon", item.icon)
        methodForm.setValue("active", item.active)
    }

    const onDeleteMethod = async (id: string, title: string) => {
        if (!confirm(`Tem certeza que deseja remover ${title}?`)) return
        try {
            await fetch(`/api/admin/method/${id}`, { method: "DELETE" })
            await fetchMethodItems()
            toast.success("Excluído com sucesso!")
        } catch (error) { toast.error("Erro ao excluir") }
    }

    const moveMethodOrder = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === methodItems.length - 1) return

        const newItems = [...methodItems]
        const targetIndex = direction === 'up' ? index - 1 : index + 1

        const temp = newItems[index]
        newItems[index] = newItems[targetIndex]
        newItems[targetIndex] = temp

        const tempOrder = newItems[index].order
        newItems[index].order = newItems[targetIndex].order
        newItems[targetIndex].order = tempOrder

        setMethodItems(newItems)

        try {
            await fetch("/api/admin/method/reorder", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify([
                    { id: newItems[index].id, order: newItems[index].order },
                    { id: newItems[targetIndex].id, order: newItems[targetIndex].order }
                ])
            })
        } catch (error) {
            logger.error("Failed to sync order", error)
            await fetchMethodItems()
        }
    }

    // --- Plan Handlers ---
    const transformPlanData = (data: z.infer<typeof planSchema>) => {
        return {
            ...data,
            price: parseFloat(data.price),
            oldPrice: data.oldPrice ? parseFloat(data.oldPrice) : null,
            features: data.features.split('\n').filter(Boolean) // Convert string from textarea to array
        }
    }

    const onCreatePlan = async (data: z.infer<typeof planSchema>) => {
        try {
            const res = await fetch("/api/admin/landing/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transformPlanData(data)),
            })
            if (!res.ok) throw new Error("Falha ao criar")
            await fetchPlans()
            setIsCreatePlanOpen(false)
            planForm.reset()
            toast.success("Salvo com sucesso!")
        } catch (error) { toast.error("Erro ao criar plano") }
    }

    const onUpdatePlan = async (data: z.infer<typeof planSchema>) => {
        if (!editingPlan) return
        try {
            const res = await fetch(`/api/admin/landing/plans/${editingPlan.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transformPlanData(data)),
            })
            if (!res.ok) throw new Error("Falha ao atualizar")
            await fetchPlans()
            setEditingPlan(null)
            planForm.reset()
            toast.success("Salvo com sucesso!")
        } catch (error) { toast.error("Erro ao atualizar plano") }
    }

    const startEditPlan = (plan: Plan) => {
        setEditingPlan(plan)
        planForm.setValue("title", plan.title)
        planForm.setValue("description", plan.description ?? "")
        planForm.setValue("price", String(plan.price))
        planForm.setValue("oldPrice", plan.oldPrice ? String(plan.oldPrice) : "")
        planForm.setValue("installments", plan.installments ?? "")
        planForm.setValue("features", plan.features.join('\n')) // Convert array to multiline string
        planForm.setValue("whatsappMessage", plan.whatsappMessage ?? "")
        planForm.setValue("highlighted", plan.highlighted)
        planForm.setValue("active", plan.active)
    }

    const onDeletePlan = async (id: string, title: string) => {
        if (!confirm(`Tem certeza que deseja remover o plano ${title}?`)) return
        try {
            await fetch(`/api/admin/landing/plans/${id}`, { method: "DELETE" })
            await fetchPlans()
            toast.success("Excluído com sucesso!")
        } catch (error) { toast.error("Erro ao excluir") }
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Editor da Landing Page</h1>
                <p className="text-muted-foreground">Gerencie cada detalhe do marketing e conteúdo do seu site.</p>
            </div>

            <Tabs defaultValue="geral" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 mb-8">
                    <TabsTrigger value="geral" className="gap-2"><Settings size={16} /> Geral</TabsTrigger>
                    <TabsTrigger value="planos" className="gap-2"><Megaphone size={16} /> Planos</TabsTrigger>
                    <TabsTrigger value="destaques" className="gap-2"><Users size={16} /> Destaques</TabsTrigger>
                    <TabsTrigger value="metodo" className="gap-2"><Layout size={16} /> Método</TabsTrigger>
                </TabsList>

                {/* --- TAB: GERAL --- */}
                <TabsContent value="geral" className="space-y-6">
                    <form onSubmit={settingsForm.handleSubmit(onUpdateSettings)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-1 bg-orange-600 rounded-full" />
                                        <div>
                                            <CardTitle>Seção Hero (Topo)</CardTitle>
                                            <CardDescription>Título principal e subtítulo da página</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Título Principal</Label>
                                        <Textarea {...settingsForm.register("landing_hero_title")} rows={3} placeholder="DOMINE CADA EDITAL" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Subtítulo / Descrição</Label>
                                        <Textarea {...settingsForm.register("landing_hero_subtitle")} rows={4} placeholder="A mentoria que transforma seu esforço..." />
                                    </div>
                                    <FormInput label="URL do Vídeo/Fundo" register={settingsForm.register("landing_hero_video_url")} placeholder="https://..." />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-1 bg-orange-600 rounded-full" />
                                        <div>
                                            <CardTitle>Chamada para Ação (CTA)</CardTitle>
                                            <CardDescription>Seção final antes do rodapé</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Título do CTA</Label>
                                        <Textarea {...settingsForm.register("landing_cta_title")} rows={3} placeholder="O PRÓXIMO NOME NA LISTA SERÁ O SEU" />
                                    </div>
                                    <FormInput label="Texto do Botão" register={settingsForm.register("landing_cta_button_text")} placeholder="QUERO SER APROVADO" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-1 bg-orange-600 rounded-full" />
                                        <div>
                                            <CardTitle>Canais de Contato</CardTitle>
                                            <CardDescription>Configurações do WhatsApp e Redes</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput label="Número WhatsApp (DDI + DDD + Num)" register={settingsForm.register("contact_whatsapp_number")} placeholder="5563999..." />
                                        <FormInput label="Instagram (Link Full)" register={settingsForm.register("social_instagram_url")} placeholder="https://instagram.com/..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mensagem Padrão WhatsApp</Label>
                                        <Textarea {...settingsForm.register("contact_whatsapp_message")} rows={2} />
                                    </div>
                                    <FormInput label="YouTube (Link Full)" register={settingsForm.register("social_youtube_url")} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-1 bg-orange-600 rounded-full" />
                                        <div>
                                            <CardTitle>Marketing & Analytics</CardTitle>
                                            <CardDescription>Scripts de rastreio e conversão</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormInput label="Facebook Pixel ID" register={settingsForm.register("marketing_fb_pixel_id")} placeholder="123456789..." />
                                    <FormInput label="Google Tag Manager ID" register={settingsForm.register("marketing_google_tag_manager_id")} placeholder="GTM-XXXX..." />
                                    <div className="p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                                        Use estes IDs para rastrear visitas e cliques no site sem precisar mexer no código-fonte.
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="flex justify-end gap-3 sticky bottom-4 z-50">
                            <Button type="submit" size="lg" className="bg-orange-600 hover:bg-orange-700 shadow-xl" disabled={settingsForm.formState.isSubmitting}>
                                {settingsForm.formState.isSubmitting ? "Salvando..." : "Salvar Configurações Gerais"}
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* --- TAB: PLANOS --- */}
                <TabsContent value="planos" className="space-y-6">
                    <section className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold">Planos de Alistamento</h1>
                                <p className="text-muted-foreground">Gerencie as ofertas e preços</p>
                            </div>
                            <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => planForm.reset()}>Adicionar Plano</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[600px]">
                                    <DialogHeader><DialogTitle>Novo Plano</DialogTitle></DialogHeader>
                                    <form onSubmit={planForm.handleSubmit(onCreatePlan)} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormInput label="Título" register={planForm.register('title')} error={planForm.formState.errors.title?.message} />
                                            <FormInput label="Descrição Curta" register={planForm.register('description')} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormInput label="Preço (R$)" type="number" step="0.01" register={planForm.register('price')} error={planForm.formState.errors.price?.message} />
                                            <FormInput label="Preço Antigo (Opcional)" type="number" step="0.01" register={planForm.register('oldPrice')} />
                                        </div>
                                        <FormInput label="Texto Pagamento (Ex: Mensal)" register={planForm.register('installments')} />
                                        <div className="space-y-1">
                                            <Label>Benefícios (um por linha)</Label>
                                            <Textarea {...planForm.register("features")} rows={5} placeholder="- Acesso total&#10;- Suporte 24h" />
                                            {planForm.formState.errors.features && <p className="text-red-500 text-xs">{planForm.formState.errors.features.message}</p>}
                                        </div>
                                        <FormInput label="Mensagem WhatsApp Individual (Opcional)" register={planForm.register('whatsappMessage')} />
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" id="hl-create" {...planForm.register("highlighted")} className="h-4 w-4" />
                                            <Label htmlFor="hl-create">Produto em Destaque (Oferta Elite)</Label>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={planForm.formState.isSubmitting}>Salvar</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="border rounded-lg p-2 bg-background">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Ordem</TableHead>
                                        <TableHead>Plano</TableHead>
                                        <TableHead>Preço</TableHead>
                                        <TableHead>Benefícios</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isPlansLoading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center h-24">Carregando...</TableCell></TableRow>
                                    ) : plans.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center h-24">Nenhum plano cadastrado.</TableCell></TableRow>
                                    ) : (
                                        plans.map((p, i) => (
                                            <TableRow key={p.id} className={p.highlighted ? "bg-orange-500/5" : ""}>
                                                <TableCell className="font-mono text-xs text-center">{p.order || i + 1}</TableCell>
                                                <TableCell>
                                                    <div className="font-bold">{p.title}</div>
                                                    <div className="text-xs text-muted-foreground">{p.description}</div>
                                                    {p.highlighted && <Badge variant="outline" className="mt-1 border-orange-500 text-orange-500 text-[10px]">Destaque</Badge>}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-bold">R$ {p.price.toFixed(2)}</div>
                                                    {p.oldPrice && <div className="text-xs line-through text-muted-foreground">R$ {p.oldPrice.toFixed(2)}</div>}
                                                    <div className="text-[10px] text-muted-foreground">{p.installments}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-xs text-muted-foreground max-h-[60px] overflow-hidden">
                                                        {p.features.length} benefícios
                                                    </div>
                                                </TableCell>
                                                <TableCell><Badge variant={p.active ? "default" : "secondary"}>{p.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="ghost" size="icon" onClick={() => startEditPlan(p)}><Pencil className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDeletePlan(p.id, p.title)}><Trash2 className="h-4 w-4" /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </section>
                </TabsContent>

                {/* --- TAB: DESTAQUES --- */}
                <TabsContent value="destaques" className="space-y-6">
                    <section className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold">Destaques da Homepage</h1>
                                <p className="text-muted-foreground">Gerencie o "Mural da Glória"</p>
                            </div>
                            <Dialog open={isCreateStudentOpen} onOpenChange={setIsCreateStudentOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => studentForm.reset()}>Adicionar Destaque</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Novo Destaque</DialogTitle></DialogHeader>
                                    <form onSubmit={studentForm.handleSubmit(onCreateStudent)} className="space-y-4">
                                        <FormInput label="Nome" register={studentForm.register('name')} error={studentForm.formState.errors.name?.message} />
                                        <div className="space-y-1">
                                            <Label>Função / Concurso (Uma por linha)</Label>
                                            <Textarea {...studentForm.register("role")} rows={3} placeholder="Ex: Aprovado PF&#10;Aprovado PRF" />
                                            {studentForm.formState.errors.role && <p className="text-red-500 text-xs">{studentForm.formState.errors.role.message}</p>}
                                        </div>
                                        <div>
                                            <Label>Foto</Label>
                                            <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "imageUrl")} />
                                            <Input type="hidden" {...studentForm.register("imageUrl")} />
                                            {studentForm.formState.errors.imageUrl && <p className="text-red-500 text-xs">{studentForm.formState.errors.imageUrl.message}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Depoimento</Label>
                                            <Textarea {...studentForm.register("quote")} placeholder="Frase do aluno..." />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={studentForm.formState.isSubmitting}>Salvar</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="border rounded-lg p-2 bg-background">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Ordem</TableHead>
                                        <TableHead className="w-[80px]">Foto</TableHead>
                                        <TableHead>Nome & Função</TableHead>
                                        <TableHead>Depoimento</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isUniqueLoading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center h-24">Carregando...</TableCell></TableRow>
                                    ) : students.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center h-24">Nenhum destaque cadastrado.</TableCell></TableRow>
                                    ) : (
                                        students.map((s, i) => (
                                            <TableRow key={s.id}>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 items-center">
                                                        <Button size="icon" variant="ghost" className="h-6 w-6" disabled={i === 0} onClick={() => moveStudentOrder(i, 'up')}><ArrowUp className="h-3 w-3" /></Button>
                                                        <span className="text-xs font-mono">{i + 1}</span>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6" disabled={i === students.length - 1} onClick={() => moveStudentOrder(i, 'down')}><ArrowDown className="h-3 w-3" /></Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="h-10 w-10 rounded-full overflow-hidden border bg-muted">
                                                        <img src={s.imageUrl} alt={s.name} className="h-full w-full object-cover" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{s.name}</div>
                                                    <div className="text-xs text-muted-foreground">{s.role}</div>
                                                </TableCell>
                                                <TableCell><div className="max-w-[300px] truncate text-sm italic">{s.quote}</div></TableCell>
                                                <TableCell><Badge variant={s.active ? "default" : "secondary"}>{s.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="ghost" size="icon" onClick={() => startEditStudent(s)}><Pencil className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDeleteStudent(s.id, s.name)}><Trash2 className="h-4 w-4" /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </section>
                </TabsContent>

                {/* --- TAB: MÉTODO --- */}
                <TabsContent value="metodo" className="space-y-6">
                    <section className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold">Método Operação 01</h1>
                                <p className="text-muted-foreground">Gerencie os passos do método</p>
                            </div>
                            <Dialog open={isCreateMethodOpen} onOpenChange={setIsCreateMethodOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => methodForm.reset()}>Adicionar Passo</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Novo Passo</DialogTitle></DialogHeader>
                                    <form onSubmit={methodForm.handleSubmit(onCreateMethod)} className="space-y-4">
                                        <FormInput label="Passo (Ex: 01)" register={methodForm.register('step')} error={methodForm.formState.errors.step?.message} />
                                        <FormInput label="Título" register={methodForm.register('title')} error={methodForm.formState.errors.title?.message} />
                                        <div className="space-y-1">
                                            <Label>Descrição</Label>
                                            <Textarea {...methodForm.register("description")} />
                                            {methodForm.formState.errors.description && <p className="text-red-500 text-xs">{methodForm.formState.errors.description.message}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Ícone</Label>
                                            <Select onValueChange={(val) => methodForm.setValue("icon", val)}>
                                                <SelectTrigger><SelectValue placeholder="Selecione um ícone" /></SelectTrigger>
                                                <SelectContent>
                                                    {AVAILABLE_ICONS.map(icon => (
                                                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input type="hidden" {...methodForm.register("icon")} />
                                            {methodForm.formState.errors.icon && <p className="text-red-500 text-xs">{methodForm.formState.errors.icon.message}</p>}
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={methodForm.formState.isSubmitting}>Salvar</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="border rounded-lg p-2 bg-background">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Ordem</TableHead>
                                        <TableHead className="w-[80px]">Ícone</TableHead>
                                        <TableHead>Passo & Título</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isMethodLoading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center h-24">Carregando...</TableCell></TableRow>
                                    ) : methodItems.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center h-24">Nenhum passo cadastrado.</TableCell></TableRow>
                                    ) : (
                                        methodItems.map((item, i) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 items-center">
                                                        <Button size="icon" variant="ghost" className="h-6 w-6" disabled={i === 0} onClick={() => moveMethodOrder(i, 'up')}><ArrowUp className="h-3 w-3" /></Button>
                                                        <span className="text-xs font-mono">{i + 1}</span>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6" disabled={i === methodItems.length - 1} onClick={() => moveMethodOrder(i, 'down')}><ArrowDown className="h-3 w-3" /></Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="p-2 bg-muted rounded border flex items-center justify-center">
                                                        <span className="text-xs font-mono">{item.icon}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-bold text-lg">{item.step}</div>
                                                    <div className="text-sm font-medium">{item.title}</div>
                                                </TableCell>
                                                <TableCell><div className="max-w-[300px] truncate text-sm text-muted-foreground">{item.description}</div></TableCell>
                                                <TableCell><Badge variant={item.active ? "default" : "secondary"}>{item.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="ghost" size="icon" onClick={() => startEditMethod(item)}><Pencil className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDeleteMethod(item.id, item.title)}><Trash2 className="h-4 w-4" /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </section>
                </TabsContent>
            </Tabs>

            {/* --- Plan Edit Modal --- */}
            <Dialog open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
                <DialogContent className="max-w-[600px]">
                    <DialogHeader><DialogTitle>Editar Plano</DialogTitle></DialogHeader>
                    <form onSubmit={planForm.handleSubmit(onUpdatePlan)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput label="Título" register={planForm.register('title')} />
                            <FormInput label="Descrição Curta" register={planForm.register('description')} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput label="Preço (R$)" type="number" step="0.01" register={planForm.register('price')} />
                            <FormInput label="Preço Antigo" type="number" step="0.01" register={planForm.register('oldPrice')} />
                        </div>
                        <FormInput label="Texto Pagamento" register={planForm.register('installments')} />
                        <div className="space-y-1">
                            <Label>Benefícios (um por linha)</Label>
                            <Textarea {...planForm.register("features")} rows={5} />
                        </div>
                        <FormInput label="Mensagem WhatsApp" register={planForm.register('whatsappMessage')} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormStatusSelect label="Status" control={planForm.register("active")} setValue={planForm.setValue} currentValue={editingPlan?.active} />
                            <div className="flex items-center gap-2 pt-6">
                                <input type="checkbox" id="hl-edit" {...planForm.register("highlighted")} className="h-4 w-4" />
                                <Label htmlFor="hl-edit">Produto em Destaque</Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingPlan(null)}>Cancelar</Button>
                            <Button type="submit" disabled={planForm.formState.isSubmitting}>Salvar Alterações</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    )
}

// --- Helper Components ---
interface FormInputProps {
    label: string;
    register: any; // react-hook-form type can be complex here
    error?: string;
    type?: string;
    step?: string;
    placeholder?: string;
}

function FormInput({ label, register, error, type = "text", step, placeholder }: FormInputProps) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Input type={type} step={step} placeholder={placeholder} {...register} />
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    )
}

interface FormStatusSelectProps {
    label?: string;
    control: any;
    setValue: (name: any, value: any) => void;
    currentValue?: boolean;
}

function FormStatusSelect({ label = "Status", control, setValue, currentValue }: FormStatusSelectProps) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Select defaultValue={currentValue ? "true" : "false"} onValueChange={(val) => setValue(control.name, val === "true")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}

