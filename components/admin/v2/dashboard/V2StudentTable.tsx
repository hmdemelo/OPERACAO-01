"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpDown, ChevronDown, ChevronUp, AlertTriangle, FileText } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { V2StudentRow } from "@/lib/metrics/v2Metrics"

type SortCol = "name" | "fase1Pct" | "fase2Pct" | "fase3Pct" | "fase3Count"

function nullAwareCompare(a: number | null, b: number | null, mult: number) {
    if (a === null && b === null) return 0
    if (a === null) return 1
    if (b === null) return -1
    return mult * (a - b)
}

function PctCell({ pct, detail }: { pct: number | null; detail?: string }) {
    if (pct === null) {
        return <span className="text-muted-foreground/60">—</span>
    }
    return (
        <span className="text-foreground">
            {pct}%
            {detail && (
                <span className="text-[10px] text-muted-foreground ml-1">{detail}</span>
            )}
        </span>
    )
}

export function V2StudentTable({ students }: { students: V2StudentRow[] }) {
    const [sort, setSort] = useState<{ col: SortCol; dir: "asc" | "desc" }>({
        col: "fase1Pct",
        dir: "desc",
    })

    function toggleSort(col: SortCol) {
        setSort(prev =>
            prev.col === col
                ? { col, dir: prev.dir === "asc" ? "desc" : "asc" }
                : { col, dir: col === "name" ? "asc" : "desc" }
        )
    }

    const sorted = [...students].sort((a, b) => {
        const mult = sort.dir === "asc" ? 1 : -1
        if (sort.col === "name") return mult * a.name.localeCompare(b.name)
        if (sort.col === "fase3Count") return mult * (a.fase3Count - b.fase3Count)
        return nullAwareCompare(a[sort.col], b[sort.col], mult)
    })

    function SortIcon({ col }: { col: SortCol }) {
        if (sort.col !== col) return <ArrowUpDown className="h-3 w-3 opacity-40" />
        return sort.dir === "asc"
            ? <ChevronUp className="h-3 w-3" />
            : <ChevronDown className="h-3 w-3" />
    }

    if (students.length === 0) {
        return (
            <div className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold mb-1">Acompanhamento individual</h3>
                <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum aluno V2 cadastrado ainda.
                </p>
            </div>
        )
    }

    const gapCount = students.filter(s => s.tone === "alert").length

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-baseline justify-between px-4 py-3 border-b">
                <h3 className="font-semibold">Acompanhamento individual</h3>
                <span className="text-xs text-muted-foreground tabular-nums">
                    {students.length} {students.length === 1 ? "aluno" : "alunos"} V2
                    {gapCount > 0 && (
                        <span className="text-destructive"> · {gapCount} com gap de transferência</span>
                    )}
                </span>
            </div>

            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead>
                            <button
                                className="flex items-center gap-1 text-xs hover:text-foreground transition-colors"
                                onClick={() => toggleSort("name")}
                            >
                                Aluno <SortIcon col="name" />
                            </button>
                        </TableHead>
                        <TableHead className="text-right">
                            <button
                                className="flex items-center gap-1 ml-auto text-xs hover:text-foreground transition-colors"
                                onClick={() => toggleSort("fase1Pct")}
                            >
                                F1 · Grade <SortIcon col="fase1Pct" />
                            </button>
                        </TableHead>
                        <TableHead className="text-right">
                            <button
                                className="flex items-center gap-1 ml-auto text-xs hover:text-foreground transition-colors"
                                onClick={() => toggleSort("fase2Pct")}
                            >
                                F2 · Cadernos <SortIcon col="fase2Pct" />
                            </button>
                        </TableHead>
                        <TableHead className="text-right">
                            <button
                                className="flex items-center gap-1 ml-auto text-xs hover:text-foreground transition-colors"
                                onClick={() => toggleSort("fase3Pct")}
                            >
                                F3 · Simulados <SortIcon col="fase3Pct" />
                            </button>
                        </TableHead>
                        <TableHead className="text-right">
                            <button
                                className="flex items-center gap-1 ml-auto text-xs hover:text-foreground transition-colors"
                                onClick={() => toggleSort("fase3Count")}
                            >
                                # Sim. <SortIcon col="fase3Count" />
                            </button>
                        </TableHead>
                        <TableHead className="text-right text-xs">Anotações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sorted.map(student => (
                        <TableRow key={student.id} className="hover:bg-muted/30 group">
                            <TableCell>
                                <Link
                                    href={`/admin/students/${student.id}/grade`}
                                    className="font-medium group-hover:text-primary transition-colors inline-flex items-center gap-1.5"
                                >
                                    {student.name}
                                    {student.tone === "alert" && (
                                        <AlertTriangle
                                            className="h-3.5 w-3.5 text-destructive shrink-0"
                                            aria-label="gap de transferência"
                                        />
                                    )}
                                </Link>
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm">
                                <PctCell
                                    pct={student.fase1Pct}
                                    detail={student.fase1Total > 0 ? `(${student.fase1Completed}/${student.fase1Total})` : undefined}
                                />
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm">
                                <PctCell
                                    pct={student.fase2Pct}
                                    detail={student.fase2Total > 0 ? `(${student.fase2Done}/${student.fase2Total})` : undefined}
                                />
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm">
                                <PctCell
                                    pct={student.fase3Pct}
                                    detail={student.fase3Total > 0 ? `(${student.fase3Correct}/${student.fase3Total})` : undefined}
                                />
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                                {student.fase3Count === 0 ? "—" : student.fase3Count}
                            </TableCell>
                            <TableCell className="text-right">
                                {student.hasErrorNotes ? (
                                    <FileText
                                        className="h-4 w-4 inline text-foreground"
                                        aria-label="aluno registrou anotações de erro"
                                    />
                                ) : (
                                    <span className="text-muted-foreground/60 text-sm">—</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
