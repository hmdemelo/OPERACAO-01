# Dashboard Aluno — Plano de Correção (2 Bugs)

## Bug 1 — StudyLog persistindo após admin deletar item do cronograma (CRÍTICO)

### Causa Raiz

O schema Prisma define a FK de **WeeklyPlanItem → StudyLog** (não o contrário):

```prisma
model WeeklyPlanItem {
  studyLogId  String?   @unique
  studyLog    StudyLog? @relation(fields: [studyLogId], references: [id])
  // SEM onDelete: Cascade aqui!
}
```

Quando o admin salva o plano e um item é removido, `POST /api/admin/plans` executa:
```ts
await tx.weeklyPlanItem.deleteMany({ where: { id: { in: idsToDelete } } })
```

→ O `WeeklyPlanItem` é deletado ✅  
→ O `StudyLog` vinculado (via `studyLogId`) **FICA ÓRFÃO** no banco ❌  
→ A dashboard do aluno lê studyLogs `getWeeklySummary`, `getStudyHistory`, `getSubjectDistribution`  
→ Dados deletados do cronograma **continuam aparecendo** na dashboard

### Fix

Antes de deletar os `WeeklyPlanItem`, buscar os `studyLogIds` vinculados e deletar os `StudyLog` correspondentes dentro da mesma transação.

**Arquivo:** `app/api/admin/plans/route.ts` — seção `idsToDelete`

---

## Bug 2 — Dashboard mostrando 0 em "Horas", "Questões", "Sessões" mas dados em "Matéria"

### Causa Raiz

`getWeeklySummary(userId)` e `getDailyProgress(userId)` filtram com janela de **7 dias** (`subDays(7)`).  
`getSubjectDistribution(userId)` **não tem filtro de data** (all-time).

Os `StudyLog` criados pelo PATCH têm `date = addDays(plan.startDate, item.dayOfWeek)`.  
`plan.startDate` é a segunda-feira da semana atual, armazenada como UTC midnight.

**Cenário de falha:** O aluno está em UTC-3 (Araguaína). Quando marca um item hoje (domingo BRT = segunda UTC), `logDate` está correto em UTC. Mas se o plano é de **semanas anteriores**, o `logDate` pode ficar fora da janela de 7 dias de `getWeeklySummary`.

**Evidência do screenshot:** "Desempenho por Matéria" mostra Raciocínio Lógi 2.0h (all-time), mas "Horas Estudadas" = 0.00h (7 dias). Os StudyLogs existem mas têm datas fora da janela de 7 dias.

### Fix

Ampliar a janela do `getWeeklySummary` para cobrir a semana atual completa **a partir do início da semana de Araguaína** (não apenas subDays(7)). Isso garante que logs desta semana sempre apareçam, independente do dia atual.

**Arquivo:** `lib/metrics/studentMetrics.ts` — `getWeeklySummary` e `getDailyProgress`

---

## Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `app/api/admin/plans/route.ts` | Deletar StudyLogs órfãos antes de deletar os WeeklyPlanItems |
| `lib/metrics/studentMetrics.ts` | `getWeeklySummary` usar início da semana Araguaína (não subDays(7)) |
