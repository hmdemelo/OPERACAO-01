'use client';

import { logger } from "@/lib/logger";
import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus, X, Copy, ClipboardPaste, GripVertical } from "lucide-react";
import { getAraguainaStartOfWeek, parseFromDatabase } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    closestCenter,
    useDroppable,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
    id?: string;
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

// ID helpers
const toItemId = (item: PlanItem) => `item-${item.dayOfWeek}-${item.blockIndex}`;
const toContainerId = (day: number) => `container-${day}`;

function parseItemId(id: string): { day: number; block: number } | null {
    if (!id.startsWith('item-')) return null;
    const rest = id.slice('item-'.length);
    const dashIdx = rest.indexOf('-');
    if (dashIdx < 0) return null;
    return {
        day: parseInt(rest.slice(0, dashIdx)),
        block: parseInt(rest.slice(dashIdx + 1)),
    };
}

function parseContainerId(id: string): number | null {
    if (!id.startsWith('container-')) return null;
    return parseInt(id.slice('container-'.length));
}

// ─── SortablePlanItem ────────────────────────────────────────────────────────

interface SortablePlanItemProps {
    item: PlanItem;
    subjects: Subject[];
    onUpdate: (day: number, block: number, field: keyof PlanItem, value: string | number) => void;
    onRemove: (day: number, block: number) => void;
}

function SortablePlanItem({ item, subjects, onUpdate, onRemove }: SortablePlanItemProps) {
    const id = toItemId(item);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const selectedSubject = subjects.find(s => s.id === item.subjectId);
    const subjectContents = selectedSubject?.contents || [];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="border border-orange-500/50 rounded flex flex-col bg-white dark:bg-slate-900 shadow-sm"
        >
            {/* Drag handle */}
            <div
                {...listeners}
                {...attributes}
                className="flex justify-center items-center py-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-t border-b border-slate-100 dark:border-slate-800 touch-none select-none"
                title="Arraste para mover"
            >
                <GripVertical className="w-3 h-3" />
            </div>

            <div className="p-2 flex flex-col gap-2 relative">
                {/* Remove */}
                <button
                    onClick={() => onRemove(item.dayOfWeek, item.blockIndex)}
                    className="absolute top-0 right-0 text-slate-300 hover:text-red-500"
                >
                    <X className="w-3 h-3" />
                </button>

                {/* Subject */}
                <Select
                    value={item.subjectId}
                    onValueChange={(val) => onUpdate(item.dayOfWeek, item.blockIndex, "subjectId", val)}
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

                {/* Content */}
                <Select
                    value={item.content}
                    onValueChange={(val) => onUpdate(item.dayOfWeek, item.blockIndex, "content", val)}
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

                {/* Notes */}
                <Textarea
                    className="min-h-[60px] text-xs resize-none overflow-hidden"
                    placeholder="Instruções / Notas"
                    value={item.notes || ""}
                    ref={(el) => {
                        if (el) {
                            el.style.height = 'auto';
                            el.style.height = `${el.scrollHeight}px`;
                        }
                    }}
                    onChange={(e) => {
                        const el = e.currentTarget;
                        el.style.height = 'auto';
                        el.style.height = `${el.scrollHeight}px`;
                        onUpdate(item.dayOfWeek, item.blockIndex, "notes", e.target.value);
                    }}
                />

                {/* Duration */}
                <div className="flex items-center gap-1">
                    <Input
                        type="number"
                        className="h-6 text-xs w-16"
                        placeholder="Min"
                        value={item.durationMinutes || 60}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            onUpdate(item.dayOfWeek, item.blockIndex, "durationMinutes", isNaN(val) ? 0 : val);
                        }}
                    />
                    <span className="text-xs text-slate-500">min</span>
                </div>
            </div>
        </div>
    );
}

// ─── DroppableDayColumn ──────────────────────────────────────────────────────

function DroppableDayColumn({ day, children, className }: { day: number; children: React.ReactNode; className?: string }) {
    const { setNodeRef, isOver } = useDroppable({ id: toContainerId(day) });
    return (
        <div
            ref={setNodeRef}
            className={`${className ?? ''} transition-colors duration-150 rounded ${isOver ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}
        >
            {children}
        </div>
    );
}

// ─── WeeklyPlanEditor ────────────────────────────────────────────────────────

export function WeeklyPlanEditor({ userId, subjects, studentName, userExams = [] }: WeeklyPlanEditorProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(getAraguainaStartOfWeek(new Date()));
    const [planItems, setPlanItems] = useState<PlanItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
    const weekDaysLabels = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

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
                dayOfWeek: item.dayOfWeek,
                blockIndex: item.blockIndex,
                subjectId: item.subjectId,
                content: item.content,
                notes: item.notes,
                durationMinutes: item.durationMinutes,
                subjectName: subject?.name || "Matéria Desconhecida"
            };
        });

        localStorage.setItem(WEEKLY_PLAN_CLIPBOARD_KEY, JSON.stringify(payload));
        toast.success(`${payload.length} itens copiados para a área de transferência!`);
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
                    const { subjectName, ...planItemProps } = item;
                    acceptedItems.push(planItemProps);
                } else {
                    rejectedSubjects.add(item.subjectName);
                }
            });

            if (acceptedItems.length > 0) {
                setPlanItems(acceptedItems);
                toast.success(`${acceptedItems.length} itens colados com sucesso!`);
            } else {
                toast.warning("Nenhum item pôde ser colado. O aluno não possui as matérias copiadas.");
            }

            if (rejectedSubjects.size > 0) {
                const rejectedList = Array.from(rejectedSubjects).join(", ");
                toast.warning(`Matérias ignoradas (sem acesso): ${rejectedList}`, { duration: 6000 });
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
                setPlanItems(data?.items ?? []);
            }
        } catch (error) {
            logger.error("Failed to fetch plan", error);
        } finally {
            setLoading(false);
        }
    };

    const updateItem = (day: number, block: number, field: keyof PlanItem, value: string | number) => {
        setPlanItems(prev =>
            prev.map(i => {
                if (i.dayOfWeek === day && i.blockIndex === block) {
                    const updated = { ...i, [field]: value };
                    if (field === 'subjectId') updated.content = "";
                    return updated;
                }
                return i;
            })
        );
    };

    const addItem = (day: number) => {
        setPlanItems(prev => {
            const dayItems = prev.filter(i => i.dayOfWeek === day);
            const maxBlock = dayItems.reduce((max, i) => Math.max(max, i.blockIndex), 0);
            return [...prev, {
                dayOfWeek: day,
                blockIndex: maxBlock + 1,
                subjectId: "",
                content: "",
                notes: "",
                durationMinutes: 60,
            }];
        });
    };

    const removeItem = (day: number, block: number) => {
        setPlanItems(prev => prev.filter(i => !(i.dayOfWeek === day && i.blockIndex === block)));
    };

    const getSortedItems = (day: number) =>
        planItems.filter(i => i.dayOfWeek === day).sort((a, b) => a.blockIndex - b.blockIndex);

    const handleSave = async () => {
        setLoading(true);
        try {
            const validItems = planItems.filter(i => i.subjectId || i.content);
            const res = await fetch("/api/admin/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, startDate: selectedDate.toISOString(), items: validItems }),
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

    // ── Drag handlers ──────────────────────────────────────────────────────────

    const handleDragStart = ({ active }: DragStartEvent) => {
        setActiveId(active.id.toString());
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        setActiveId(null);
        if (!over || active.id === over.id) return;

        const srcParsed = parseItemId(active.id.toString());
        if (!srcParsed) return;
        const { day: srcDay, block: srcBlock } = srcParsed;

        const overId = over.id.toString();
        const isContainer = overId.startsWith('container-');
        const destDay = isContainer
            ? parseContainerId(overId)
            : parseItemId(overId)?.day ?? null;

        if (destDay === null) return;

        setPlanItems(prev => {
            const srcItems = prev
                .filter(i => i.dayOfWeek === srcDay)
                .sort((a, b) => a.blockIndex - b.blockIndex);
            const draggedIdx = srcItems.findIndex(i => i.blockIndex === srcBlock);
            if (draggedIdx < 0) return prev;

            // Same-day reorder
            if (srcDay === destDay) {
                if (isContainer) return prev;
                const destParsed = parseItemId(overId);
                if (!destParsed) return prev;
                const destIdx = srcItems.findIndex(i => i.blockIndex === destParsed.block);
                if (destIdx < 0 || destIdx === draggedIdx) return prev;

                const reordered = arrayMove(srcItems, draggedIdx, destIdx);
                const renumbered = reordered.map((item, i) => ({ ...item, blockIndex: i + 1 }));
                return [...prev.filter(i => i.dayOfWeek !== srcDay), ...renumbered];
            }

            // Cross-day move
            const draggedItem = srcItems[draggedIdx];
            const newSrcItems = srcItems
                .filter((_, i) => i !== draggedIdx)
                .map((item, i) => ({ ...item, blockIndex: i + 1 }));

            const destItems = prev
                .filter(i => i.dayOfWeek === destDay)
                .sort((a, b) => a.blockIndex - b.blockIndex);

            const movedItem = { ...draggedItem, dayOfWeek: destDay };

            let insertAt: number;
            if (isContainer) {
                insertAt = destItems.length;
            } else {
                const destParsed = parseItemId(overId);
                insertAt = destParsed
                    ? destItems.findIndex(i => i.blockIndex === destParsed.block)
                    : destItems.length;
                if (insertAt < 0) insertAt = destItems.length;
            }

            const newDestItems = [
                ...destItems.slice(0, insertAt),
                movedItem,
                ...destItems.slice(insertAt),
            ].map((item, i) => ({ ...item, blockIndex: i + 1 }));

            const others = prev.filter(i => i.dayOfWeek !== srcDay && i.dayOfWeek !== destDay);
            return [...others, ...newSrcItems, ...newDestItems];
        });
    };

    // Item being dragged (for overlay)
    const activeItem = activeId ? planItems.find(i => toItemId(i) === activeId) : null;

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

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-7 gap-2 min-w-[1200px] overflow-x-auto pb-4">
                    {daysOfWeek.map(day => {
                        const items = getSortedItems(day);
                        const ids = items.map(toItemId);

                        return (
                            <div key={day} className="flex flex-col gap-2 min-w-[160px]">
                                <div className="font-bold text-center p-2 bg-slate-100 dark:bg-slate-800/60 rounded dark:text-slate-200">
                                    {weekDaysLabels[day]}
                                    <div className="text-xs font-normal text-slate-500 dark:text-slate-400">
                                        {format(addDays(selectedDate, day), "dd/MM")}
                                    </div>
                                </div>

                                <DroppableDayColumn day={day} className="flex flex-col gap-2 flex-1 min-h-[40px]">
                                    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                                        {items.map(item => (
                                            <SortablePlanItem
                                                key={toItemId(item)}
                                                item={item}
                                                subjects={subjects}
                                                onUpdate={updateItem}
                                                onRemove={removeItem}
                                            />
                                        ))}
                                    </SortableContext>
                                </DroppableDayColumn>

                                <Button
                                    variant="ghost"
                                    className="w-full border border-dashed text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                                    onClick={() => addItem(day)}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        );
                    })}
                </div>

                <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
                    {activeItem && (
                        <div className="border border-orange-500/70 rounded bg-white dark:bg-slate-900 shadow-xl w-[160px] flex flex-col opacity-95">
                            <div className="flex justify-center items-center py-1 bg-slate-50 dark:bg-slate-800/50 rounded-t border-b border-slate-100 dark:border-slate-800">
                                <GripVertical className="w-3 h-3 text-slate-400" />
                            </div>
                            <div className="p-2 text-xs flex flex-col gap-1">
                                <span className="font-semibold text-slate-600 dark:text-slate-300 truncate">
                                    {subjects.find(s => s.id === activeItem.subjectId)?.name || "Bloco"}
                                </span>
                                {activeItem.content && (
                                    <span className="text-slate-400 truncate">{activeItem.content}</span>
                                )}
                                {activeItem.durationMinutes && (
                                    <span className="text-slate-300">{activeItem.durationMinutes}min</span>
                                )}
                            </div>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
