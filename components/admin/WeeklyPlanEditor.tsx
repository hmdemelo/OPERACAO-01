'use client';

import { logger } from "@/lib/logger";
import { useState, useEffect } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Added
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus, X, Copy, ClipboardPaste } from "lucide-react";
import { getAraguainaStartOfWeek, parseFromDatabase } from "@/lib/date-utils";

import { Badge } from "@/components/ui/badge";

const WEEKLY_PLAN_CLIPBOARD_KEY = "weeklyPlanClipboard";

interface Content {
    id: string;
    name: string;
}

interface Subject {
    id: string;
    name: string;
    contents?: Content[];
}

interface PlanItem {
    dayOfWeek: number;
    blockIndex: number;
    subjectId: string;
    content: string;
    notes?: string;
    durationMinutes: number;
}

interface WeeklyPlanEditorProps {
    userId: string;
    subjects: Subject[];
    studentName?: string;
    userExams?: string[];
}

export function WeeklyPlanEditor({ userId, subjects, studentName, userExams = [] }: WeeklyPlanEditorProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(getAraguainaStartOfWeek(new Date()));
    const [planItems, setPlanItems] = useState<PlanItem[]>([]);
    const [loading, setLoading] = useState(false);

    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Sun to Sat

    useEffect(() => {
        fetchPlan();
    }, [selectedDate]);

    const handleCopyWeek = () => {
        if (planItems.length === 0) {
            toast.error("A semana atual está vazia. Não há o que copiar.");
            return;
        }

        const validItems = planItems.filter(i => i.subjectId || i.content);
        if (validItems.length === 0) {
            toast.error("A semana não possui matérias válidas para copiar.");
            return;
        }

        const payload = validItems.map(item => {
            const subject = subjects.find(s => s.id === item.subjectId);
            return {
                ...item,
                subjectName: subject?.name || "Matéria Desconhecida"
            };
        });

        localStorage.setItem(WEEKLY_PLAN_CLIPBOARD_KEY, JSON.stringify(payload));
        toast.success(`${payload.length} blocos copiados para a área de transferência!`);
    };

    const handlePasteWeek = () => {
        const clipboardData = localStorage.getItem(WEEKLY_PLAN_CLIPBOARD_KEY);
        if (!clipboardData) {
            toast.error("Área de transferência vazia. Copie uma semana primeiro.");
            return;
        }

        try {
            const copiedItems = JSON.parse(clipboardData) as (PlanItem & { subjectName: string })[];
            if (!Array.isArray(copiedItems) || copiedItems.length === 0) {
                toast.error("Dados copiados inválidos.");
                return;
            }

            const allowedSubjectIds = new Set(subjects.map(s => s.id));
            const acceptedItems: PlanItem[] = [];
            const rejectedSubjects = new Set<string>();

            copiedItems.forEach(item => {
                if (allowedSubjectIds.has(item.subjectId)) {
                    // Extract only PlanItem properties to keep state clean
                    const { subjectName, ...planItemProps } = item;
                    acceptedItems.push(planItemProps);
                } else {
                    rejectedSubjects.add(item.subjectName);
                }
            });

            if (acceptedItems.length > 0) {
                // If there were existing items, we overwrite them for simplicity (or merge)?
                // The prompt says "colar no grid", usually paste overwrites or appends.
                // Let's overwrite the week completely to avoid duplicate blockIndex collisions.
                setPlanItems(acceptedItems);
                toast.success(`${acceptedItems.length} blocos colados com sucesso!`);
            } else {
                toast.warning("Nenhum bloco pôde ser colado. O aluno não possui as matérias copiadas.");
            }

            if (rejectedSubjects.size > 0) {
                const rejectedList = Array.from(rejectedSubjects).join(", ");
                toast.warning(`Matérias ignoradas (sem acesso): ${rejectedList}`, {
                    duration: 6000,
                });
            }

        } catch (e) {
            logger.error("Error parsing clipboard data", e);
            toast.error("Falha ao ler dados da área de transferência.");
        }
    };

    const fetchPlan = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/plans?userId=${userId}&date=${selectedDate.toISOString()}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.items) {
                    setPlanItems(data.items);
                } else {
                    setPlanItems([]);
                }
            }
        } catch (error) {
            logger.error("Failed to fetch plan", error);
        } finally {
            setLoading(false);
        }
    };

    const updateItem = (day: number, block: number, field: keyof PlanItem, value: string | number) => {
        setPlanItems(prev => {
            return prev.map(i => {
                if (i.dayOfWeek === day && i.blockIndex === block) {
                    const updated = { ...i, [field]: value };
                    // If subject changes, clear content
                    if (field === 'subjectId') {
                        updated.content = "";
                    }
                    return updated;
                }
                return i;
            });
        });
    };

    const addItem = (day: number) => {
        setPlanItems(prev => {
            const dayItems = prev.filter(i => i.dayOfWeek === day);
            const maxBlock = dayItems.reduce((max, i) => Math.max(max, i.blockIndex), 0);
            const newItem: PlanItem = {
                dayOfWeek: day,
                blockIndex: maxBlock + 1,
                subjectId: "",
                content: "",
                notes: "",
                durationMinutes: 60
            };
            return [...prev, newItem];
        });
    }

    const removeItem = (day: number, block: number) => {
        setPlanItems(prev => prev.filter(i => !(i.dayOfWeek === day && i.blockIndex === block)));
    }

    const getSortedItems = (day: number) => {
        return planItems.filter(i => i.dayOfWeek === day).sort((a, b) => a.blockIndex - b.blockIndex);
    }

    const handleSave = async () => {
        setLoading(true);
        try {
            const validItems = planItems.filter(i => i.subjectId || i.content);
            const res = await fetch("/api/admin/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    startDate: selectedDate.toISOString(), // ISO stays consistent with z-offset
                    items: validItems,
                }),
            });

            if (res.ok) {
                toast.success("Cronograma salvo com sucesso!");
            } else {
                toast.error("Erro ao salvar cronograma.");
            }
        } catch (error) {
            logger.error(error);
            toast.error("Erro ao salvar cronograma.");
        } finally {
            setLoading(false);
        }
    };

    const weekDaysLabels = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

    return (
        <div className="space-y-6">
            <div className="bg-card border rounded-xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold tracking-tight">Cronograma Semanal</h2>
                            <Badge variant="outline" className="text-xs font-medium px-2 py-0.5 border-primary/20 bg-primary/5">
                                {format(selectedDate, "dd/MM")}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground italic">Aluno:</span>
                                <span className="font-semibold text-foreground">{studentName || "Aluno"}</span>
                            </div>

                            {userExams.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground italic">Foco:</span>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {userExams.map((exam, idx) => (
                                            <Badge key={idx} variant="secondary" className="bg-orange-500/10 text-orange-600 border-none px-2 h-5 font-bold text-[10px] uppercase tracking-wider">
                                                {exam}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                        <div className="flex bg-muted/50 p-1 rounded-lg">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(d => addDays(d, -7))} className="h-8 px-3 text-xs">Semana Anterior</Button>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(d => addDays(d, 7))} className="h-8 px-3 text-xs">Próxima Semana</Button>
                        </div>
                        <div className="flex bg-muted/30 p-1 rounded-lg gap-1 border border-border/50">
                            <Button variant="ghost" size="icon" onClick={handleCopyWeek} title="Copiar Semana" className="h-8 w-8 text-slate-500 hover:text-primary">
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handlePasteWeek} title="Colar Semana" className="h-8 w-8 text-slate-500 hover:text-primary">
                                <ClipboardPaste className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button onClick={handleSave} disabled={loading} className="shadow-lg shadow-primary/10 ml-auto md:ml-0 h-10 px-6">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Cronograma
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 min-w-[1200px] overflow-x-auto pb-4">
                {daysOfWeek.map(day => {
                    const items = getSortedItems(day);
                    return (
                        <div key={day} className="flex flex-col gap-2 min-w-[160px]">
                            <div className="font-bold text-center p-2 bg-slate-100 dark:bg-slate-800/60 rounded dark:text-slate-200">
                                {weekDaysLabels[day]}
                                <div className="text-xs font-normal text-slate-500 dark:text-slate-400">
                                    {format(addDays(selectedDate, day), "dd/MM")}
                                </div>
                            </div>

                            {items.map((item) => {
                                const selectedSubject = subjects.find(s => s.id === item.subjectId);
                                const subjectContents = selectedSubject?.contents || [];

                                return (
                                    <div key={`${day}-${item.blockIndex}`} className="relative border border-orange-500/50 rounded p-2 flex flex-col gap-2 bg-white dark:bg-slate-900 shadow-sm">
                                        <button
                                            onClick={() => removeItem(day, item.blockIndex)}
                                            className="absolute top-1 right-1 text-slate-300 hover:text-red-500"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>

                                        {/* Subject Select */}
                                        <Select
                                            value={item.subjectId}
                                            onValueChange={(val) => updateItem(day, item.blockIndex, "subjectId", val)}
                                        >
                                            <SelectTrigger className="h-8 text-xs mt-3">
                                                <SelectValue placeholder="Matéria" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map(s => (
                                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {/* Content Select - Only if subject selected */}
                                        <Select
                                            value={item.content}
                                            onValueChange={(val) => updateItem(day, item.blockIndex, "content", val)}
                                            disabled={!item.subjectId}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Conteúdo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjectContents.length > 0 ? (
                                                    subjectContents.map(c => (
                                                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="custom" disabled>Nenhum conteúdo</SelectItem>
                                                )}
                                            </SelectContent>

                                        </Select>

                                        {/* Notes Textarea */}
                                        <Textarea
                                            className="min-h-[60px] text-xs"
                                            placeholder="Instruções / Notas"
                                            value={item.notes || ""}
                                            onChange={(e) => updateItem(day, item.blockIndex, "notes", e.target.value)}
                                        />

                                        <div className="flex items-center gap-1">
                                            <Input
                                                type="number"
                                                className="h-6 text-xs w-16"
                                                placeholder="Min"
                                                value={item.durationMinutes || 60}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    updateItem(day, item.blockIndex, "durationMinutes", isNaN(val) ? 0 : val);
                                                }}
                                            />
                                            <span className="text-xs text-slate-500">min</span>
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Add Button */}
                            <Button variant="ghost" className="w-full border border-dashed text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-300" onClick={() => addItem(day)}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    )
                })}
            </div>
        </div >
    );
}
