# Política de Retenção de Dados
**Plataforma:** Operação 01
**Versão:** 1.0 — vigente desde 2026-05-24
**Base legal:** LGPD (Lei 13.709/2018), arts. 15 e 16

---

## 1. Princípio

Mantemos cada categoria de dado apenas pelo tempo estritamente necessário ao
cumprimento da finalidade declarada na [Política de Privacidade](../app/privacidade/page.tsx).
Após o prazo, os dados são eliminados fisicamente do banco ou anonimizados.

---

## 2. Tabela de retenção por categoria

| Categoria | Tabela | Tempo | Critério | Como é aplicado |
|---|---|---|---|---|
| Cadastro do usuário | `User` | Enquanto conta ativa | Exclusão pelo titular ou admin | Hard delete em cascade |
| Logs de estudo | `StudyLog` | Vinculado ao `User` | Cascade ao excluir `User` | `onDelete: Cascade` |
| Histórico de edições | `StudyLogHistory` | **24 meses após criação** | Auditoria de curto prazo | Job mensal de limpeza (ver §3) |
| Respostas de questões | `QuestionAnswer` | Vinculado ao `User` | Cascade ao excluir `User` | `onDelete: Cascade` |
| Grade de estudos | `StudyGrid` + blocks | Vinculado ao `User` | Cascade ao excluir `User` | `onDelete: Cascade` |
| Plano semanal | `WeeklyPlan` + items | Vinculado ao `User` | Cascade ao excluir `User` | `onDelete: Cascade` |
| Vínculos disciplina/concurso | `UserSubject`, `UserConcurso` | Vinculado ao `User` | Cascade ao excluir `User` | `onDelete: Cascade` |
| Vínculo de mentoria | `MentorshipLink` | Vinculado ao `User` | Cascade ao excluir `User` ou mentor | `onDelete: Cascade` |
| Simulados e blocos | `Simulation`, `SimulationBlock` | Vinculado ao `StudyGrid` → `User` | Cascade transitivo | `onDelete: Cascade` |
| Questões enviadas | `Question` | Indefinido (acervo institucional) | Conteúdo pedagógico | `uploadedBy = NULL` após delete do autor |
| Aprovações de questões | `Question.approvedById` | Indefinido | Auditoria do conteúdo | `approvedBy = NULL` após delete do aprovador |
| Aprovações em auditoria | `StudyLogHistory.changedById` | 24 meses (vide acima) | Auditoria curta | `changedBy = NULL` após delete do autor |

---

## 3. Limpeza automática de `StudyLogHistory`

**Por que 24 meses?** A tabela `StudyLogHistory` registra cada edição de um
log de estudo (valor anterior, novo valor, autor, data). Serve para detectar
fraudes de aderência e disputas pedagógicas — esse tipo de auditoria não
precisa retroagir além de 2 anos para os fins da plataforma.

**Como é aplicada:**

- Endpoint protegido: `POST /api/admin/maintenance/cleanup-history`
- Autorização: header `Authorization: Bearer ${CRON_SECRET}`
- Frequência sugerida: mensal (primeiro dia de cada mês, 03:00 UTC)
- Critério: `DELETE FROM StudyLogHistory WHERE changedAt < NOW() - INTERVAL '24 months'`

**Configurar em produção (Vercel Cron):**

Adicionar ao `vercel.json` na raiz do projeto:

```json
{
  "crons": [
    {
      "path": "/api/admin/maintenance/cleanup-history",
      "schedule": "0 3 1 * *"
    }
  ]
}
```

E definir a variável de ambiente `CRON_SECRET` na Vercel.

---

## 4. Exclusão por solicitação do titular

A LGPD garante ao titular o direito de eliminação dos dados (art. 18, VI).
Implementação atual:

- **Autodeleção pelo aluno:** disponível em `/student/profile` → aba Acadêmico → "Zona de Perigo"
- **Exclusão pelo admin:** disponível em `/admin/users/[id]`
- Ambos os fluxos disparam `prisma.user.delete()`, que aciona o cascade descrito
  na tabela acima e finaliza com o expurgo físico do registro do `User`.

Prazo máximo de execução após solicitação manual via e-mail
`privacidade@operacao01.com.br`: **15 dias úteis** (conforme Política de Privacidade).

---

## 5. Portabilidade

O direito à portabilidade (LGPD art. 18, V) é atendido pelo endpoint
`GET /api/user/export`, que retorna um JSON com todos os dados do titular
autenticado. O export NUNCA inclui `passwordHash` nem dados de terceiros.

---

## 6. Backups

Backups automáticos do banco PostgreSQL (provedor Supabase) seguem a política
do provedor — tipicamente 7 dias de retenção em PITR (Point-in-Time Recovery).
Backups são apenas para recuperação de desastre, nunca para uso analítico, e
serão purgados naturalmente no ciclo do provedor após a exclusão do titular.

---

## 7. Revisão

Este documento deve ser revisado anualmente ou quando houver mudança
material na arquitetura de dados. Próxima revisão prevista: **2027-05-24**.

---

*Última atualização: 2026-05-24*
