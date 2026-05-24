# LGPD — Plano de Implementação
**Plataforma:** Operação 01
**Data:** 2026-05-24
**Referência:** [LGPD.md](LGPD.md)

---

## Estratégia geral

Implementação em **3 sprints sequenciais**, do mais crítico (exposição legal imediata) ao mais estrutural (boas práticas de retenção). Cada sprint é independente e deployável.

| Sprint | Foco | Prazo | Risco coberto |
|---|---|---|---|
| **1** | Documentação legal + Consentimento de cookies | 7 dias | Crítico |
| **2** | Direitos do titular (exclusão real + cascades) | 30 dias | Alto |
| **3** | Portabilidade + Retenção + Tratamento do CPF | 60 dias | Médio |

---

# SPRINT 1 — Crítico (7 dias)

> **Objetivo:** Cessar imediatamente a violação de carregar trackers sem consentimento e publicar os documentos legais mínimos. Deploy único ao final do sprint.

## Tarefa 1.1 — Política de Privacidade

**Arquivo a criar:** [app/privacidade/page.tsx](app/privacidade/page.tsx)

**Estrutura técnica:**
- Server component (estático, sem dados dinâmicos)
- `export const metadata` com `noindex: false` (queremos indexável)
- Conteúdo em JSX puro, usando `prose` do Tailwind Typography
- Wrapper: `<main className="container mx-auto px-4 py-12 max-w-3xl prose prose-invert">`

**Seções obrigatórias (conforme LGPD.md §5.1):**
1. Identificação do controlador
2. Dados coletados (tabela com finalidade)
3. Base legal por dado
4. Compartilhamento com terceiros (Vercel/Meta/Google)
5. Tempo de retenção
6. Direitos do titular (art. 18)
7. Como exercer os direitos (canal + prazo de 15 dias)
8. Cookies
9. Segurança técnica
10. Alterações na política
11. Data de vigência

**Critério de pronto:** Página acessível em `/privacidade`, linkada do rodapé, indexável pelo Google.

---

## Tarefa 1.2 — Termos de Uso

**Arquivo a criar:** [app/termos/page.tsx](app/termos/page.tsx)

**Estrutura técnica:** Idêntica à 1.1.

**Seções obrigatórias:**
1. Aceite e capacidade civil
2. Cadastro e responsabilidades do usuário
3. Descrição do serviço (mentoria, fases 1-3, banco de questões)
4. Propriedade intelectual (conteúdo do mentor)
5. Conduta proibida
6. Suspensão e encerramento
7. Limitação de responsabilidade
8. Política de reembolso (se aplicável)
9. Foro e lei aplicável (Comarca de Araguaína/TO)
10. Data de vigência

**Critério de pronto:** Página acessível em `/termos`, linkada do rodapé.

---

## Tarefa 1.3 — Canal de Privacidade no Rodapé

**Arquivo a editar:** [components/landing/Footer.tsx](components/landing/Footer.tsx)

**Mudanças:**
1. Adicionar bloco com e-mail `privacidade@operacao01.com.br`
2. Adicionar links para `/privacidade` e `/termos`
3. Adicionar identificação resumida do controlador (razão social / CNPJ)

**Estrutura sugerida (3 colunas):**
```
┌─ Operação 01     ─┬─ Legal              ─┬─ Contato           ─┐
│ © 2026            │ Política de Privacid. │ contato@...        │
│ Mentoria elite    │ Termos de Uso         │ privacidade@...    │
│ CNPJ: XX.XXX...   │                       │                    │
└───────────────────┴───────────────────────┴────────────────────┘
```

**Critério de pronto:** Rodapé exibe os 3 elementos novos, sem quebrar layout mobile.

---

## Tarefa 1.4 — Banner de Cookies (opt-in real)

**Arquivo a criar:** [components/landing/CookieBanner.tsx](components/landing/CookieBanner.tsx)

**Especificação técnica:**

```tsx
"use client"

type ConsentState = "pending" | "accepted" | "rejected"
const STORAGE_KEY = "cookieConsent"

// API pública:
//   useCookieConsent(): { state, accept, reject }
//   <CookieBanner /> — renderiza o banner se state === "pending"
```

**Comportamento:**
- No mount, lê `localStorage.getItem("cookieConsent")`
- Se `null` ou inválido → estado `"pending"` → exibe banner
- Botão "Aceitar" → grava `"accepted"` + timestamp + versão da política
- Botão "Recusar" → grava `"rejected"` + timestamp
- Botão "Saiba mais" → link para `/privacidade`
- Banner fixed bottom, full width, z-index 50, fundo `bg-background border-t`

**Estrutura de armazenamento:**
```json
{
  "decision": "accepted",
  "timestamp": "2026-05-24T14:30:00.000Z",
  "policyVersion": "1.0"
}
```

**Critério de pronto:** Banner aparece para visitante novo, some após decisão, decisão persiste entre sessões.

---

## Tarefa 1.5 — Bloqueio prévio dos scripts de tracking

**Arquivos a editar:**
- [components/landing/MarketingScripts.tsx](components/landing/MarketingScripts.tsx)
- [app/page.tsx](app/page.tsx)

**Mudanças em `MarketingScripts.tsx`:**
1. Converter para client component
2. Importar e usar `useCookieConsent()`
3. Retornar `null` se `state !== "accepted"`
4. Manter as IDs vindas do banco como props

**Mudanças em `app/page.tsx`:**
1. `<MarketingScripts fbPixelId={...} gtmId={...} />` continua igual — a guarda passa a ser interna
2. Adicionar `<CookieBanner />` no final do JSX

**Critério de pronto:**
- Visitante novo → DevTools Network: nenhuma requisição para `connect.facebook.net` ou `googletagmanager.com`
- Após clicar "Aceitar" → scripts carregam imediatamente (sem reload)
- Após clicar "Recusar" → scripts permanecem bloqueados

---

## Tarefa 1.6 — Validação manual do Sprint 1

**Checklist de testes:**
- [ ] `/privacidade` carrega e está linkado do rodapé
- [ ] `/termos` carrega e está linkado do rodapé
- [ ] E-mail `privacidade@operacao01.com.br` está visível no rodapé
- [ ] Em navegador anônimo: banner aparece na primeira visita
- [ ] Em navegador anônimo + sem aceite: zero requisições para Meta/Google
- [ ] Aceite persiste após reload
- [ ] Recusa persiste após reload
- [ ] Layout do banner não quebra em mobile (375px)

---

# SPRINT 2 — Alto (30 dias)

> **Objetivo:** Garantir que o usuário consiga efetivamente excluir sua conta e que essa exclusão seja real (hard delete sem violar FK).

## Tarefa 2.1 — Correção dos cascades no Prisma

**Arquivo a editar:** [prisma/schema.prisma](prisma/schema.prisma)

**Mudanças:**

```prisma
// model Question
uploadedBy    User  @relation("QuestionUploader", fields: [uploadedById], references: [id], onDelete: SetNull)
approvedBy    User? @relation("QuestionApprover", fields: [approvedById], references: [id], onDelete: SetNull)
// uploadedById também precisa virar opcional (String?) para suportar SetNull

// model StudyLogHistory
changedBy     User? @relation(fields: [changedById], references: [id], onDelete: SetNull)
// changedById também precisa virar opcional
```

**Migration:**
- Criar com `npx prisma migrate dev --name lgpd_user_deletion_cascades --create-only`
- SQL esperado:
  ```sql
  ALTER TABLE "Question" DROP CONSTRAINT "Question_uploadedById_fkey";
  ALTER TABLE "Question" ALTER COLUMN "uploadedById" DROP NOT NULL;
  ALTER TABLE "Question" ADD CONSTRAINT "Question_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL;
  -- idem para approvedBy e StudyLogHistory.changedBy
  ```

**Critério de pronto:**
- `prisma migrate status` limpo no local
- Excluir um usuário que tenha enviado questões não quebra a integridade

---

## Tarefa 2.2 — Hard delete no endpoint de admin

**Arquivo a editar:** [app/api/admin/users/[id]/route.ts](app/api/admin/users/[id]/route.ts)

**Mudança no método DELETE:**
- Substituir `prisma.user.update({ data: { active: false } })` por `prisma.user.delete({ where: { id } })`
- Manter checagem de role (apenas ADMIN)
- Manter proibição de auto-exclusão (ADMIN não pode deletar a si mesmo)
- Logar a ação (Pino) com `userId`, `deletedBy`, `timestamp` — sem expor PII

**Critério de pronto:**
- Admin exclui aluno via UI → registro some do banco + todas as relações em cascade
- Tentativa de auto-exclusão retorna 400
- Tentativa por não-admin retorna 403

---

## Tarefa 2.3 — Endpoint de autodeleção pelo titular

**Arquivo a criar:** [app/api/user/account/route.ts](app/api/user/account/route.ts)

**Método:** `DELETE`

**Especificação:**

```ts
// Body: { password: string }
// 1. getServerSession → exigir usuário autenticado
// 2. Buscar user.passwordHash
// 3. bcrypt.compare(body.password, user.passwordHash) — falha = 401
// 4. prisma.user.delete({ where: { id: session.user.id } })
// 5. Retornar 200 — o cliente fará signOut + redirect para /
```

**Validações:**
- Usuário ADMIN: bloquear autodeleção (retornar 400 com mensagem clara)
- Usuário MENTOR: bloquear autodeleção (precisa de transferência de alunos)
- Apenas STUDENT pode autodeletar diretamente

**Critério de pronto:**
- Aluno fornece senha correta → conta + logs + plano + grade + simulados removidos
- Senha errada → 401, conta intacta
- Admin/Mentor tentando → 400

---

## Tarefa 2.4 — UI de autodeleção na área do aluno

**Arquivo a editar:** [app/student/profile/page.tsx](app/student/profile/page.tsx)

**Adições:**
- Nova seção no final da página: "Zona de Perigo"
- Card vermelho com texto explicativo + botão "Excluir minha conta"
- Botão abre Dialog (shadcn/ui) com:
  - Texto explicando que a ação é irreversível
  - Lista do que será apagado (logs, grade, plano semanal, respostas, simulados)
  - Input de senha (obrigatório)
  - Checkbox "Entendo que esta ação é permanente"
  - Botão "Confirmar exclusão" (desabilitado até senha+checkbox)
- Após sucesso: toast + `signOut({ callbackUrl: "/" })`

**Texto do disclaimer:**
> "Esta ação é **irreversível**. Todos os seus dados serão permanentemente removidos:
> - Seus logs de estudo e histórico de revisões
> - Sua grade de estudos (Fases 1, 2 e 3)
> - Suas respostas no banco de questões
> - Seu plano semanal
>
> Em conformidade com o art. 18, VI da LGPD, a exclusão é definitiva."

**Critério de pronto:**
- Aluno consegue excluir a própria conta a partir do perfil
- Fluxo bloqueia se senha incorreta
- Após exclusão, sessão é encerrada e usuário é redirecionado para landing

---

## Tarefa 2.5 — Validação manual do Sprint 2

**Cenários de teste:**
- [ ] Aluno se autoexclui via `/student/profile` → user some + cascade funciona
- [ ] Aluno com questões enviadas é excluído → questões permanecem com `uploadedById = NULL`
- [ ] Aluno com histórico de log é excluído → `StudyLogHistory.changedById = NULL` para entradas dele
- [ ] Admin tenta autoexcluir → 400
- [ ] Mentor tenta autoexcluir → 400
- [ ] Admin exclui aluno via painel → hard delete funciona

---

# SPRINT 3 — Médio (60 dias)

> **Objetivo:** Atender portabilidade (art. 18, V), formalizar política de retenção e decidir sobre o tratamento do CPF.

## Tarefa 3.1 — Endpoint de exportação de dados (portabilidade)

**Arquivo a criar:** [app/api/user/export/route.ts](app/api/user/export/route.ts)

**Método:** `GET`

**Especificação:**

```ts
// Retorna JSON com TODOS os dados do titular autenticado:
{
  exportadoEm: "2026-05-24T...",
  versaoFormato: "1.0",
  perfil: { /* User sem passwordHash */ },
  logsDeEstudo: [/* StudyLog */],
  historicoDeLogs: [/* StudyLogHistory */],
  planoSemanal: [/* WeeklyPlan + WeeklyPlanItem */],
  gradeDeEstudos: { /* StudyGrid + Blocks + Topics */ },
  simulados: [/* Simulation + SimulationBlock */],
  respostasDeQuestoes: [/* QuestionAnswer */],
  disciplinasVinculadas: [/* UserSubject */],
  concursosVinculados: [/* UserConcurso */]
}
```

**Headers de resposta:**
- `Content-Type: application/json`
- `Content-Disposition: attachment; filename="operacao01-meus-dados-{YYYY-MM-DD}.json"`

**Critério de pronto:**
- Aluno acessa `/student/profile` → botão "Baixar meus dados"
- Download retorna JSON estruturado com todos os dados pessoais
- Senhas NUNCA aparecem (mesmo hash)

---

## Tarefa 3.2 — UI de exportação na área do aluno

**Arquivo a editar:** [app/student/profile/page.tsx](app/student/profile/page.tsx)

**Adição:** Botão "Exportar meus dados (LGPD)" na seção de conta, acima da Zona de Perigo.

Clique → `window.location.href = "/api/user/export"`.

---

## Tarefa 3.3 — Política de retenção documentada

**Arquivo a criar:** [docs/RETENCAO_DADOS.md](docs/RETENCAO_DADOS.md)

**Conteúdo:**

| Tabela | Tempo de retenção | Critério | Como é aplicado |
|---|---|---|---|
| `User` | Enquanto conta ativa | Exclusão pelo titular ou admin | Hard delete em cascade |
| `StudyLog` | Vinculado ao User | Cascade ao excluir User | `onDelete: Cascade` |
| `StudyLogHistory` | 24 meses após criação | Auditoria curta | Job mensal de limpeza |
| `QuestionAnswer` | Vinculado ao User | Cascade ao excluir User | `onDelete: Cascade` |
| `Question` | Indefinido (acervo) | Conteúdo institucional | `uploadedBy = NULL` após delete |
| `Simulation` / `SimulationBlock` | Vinculado ao StudyGrid → User | Cascade | `onDelete: Cascade` |

---

## Tarefa 3.4 — Job de limpeza de `StudyLogHistory`

**Arquivo a criar:** [scripts/cleanup-study-log-history.ts](scripts/cleanup-study-log-history.ts)

**Especificação:**

```ts
// Executado mensalmente (Vercel Cron ou rotina externa)
// DELETE FROM StudyLogHistory WHERE createdAt < NOW() - INTERVAL '24 months'
// Loga quantidade removida
```

**Integração:**
- Adicionar entrada em `vercel.json` (`crons`) chamando `/api/admin/maintenance/cleanup-history`
- Endpoint protegido por header `Authorization: Bearer ${CRON_SECRET}`

**Critério de pronto:**
- Job executa primeiro dia de cada mês
- Logs antigos são removidos
- Logs recentes (< 24 meses) permanecem intactos

---

## Tarefa 3.5 — Decisão sobre o CPF

**Investigação prévia obrigatória (antes de codar):**
1. O CPF é exibido em algum lugar do painel admin?
2. É usado para integração externa (pagamento, emissão de nota fiscal)?
3. É exibido ao próprio aluno?

**Caminhos possíveis (escolher um após investigação):**

### Opção A — Remover o campo
- Se CPF não tem uso real, remover do schema e dos formulários
- Migration: `ALTER TABLE "User" DROP COLUMN "cpf"`
- Menor risco e maior conformidade

### Opção B — Criptografia simétrica (AES-256-GCM)
- Adicionar `lib/crypto/cpfCipher.ts` com `encrypt()` / `decrypt()`
- Migration de dados: criptografar CPFs existentes
- Chave em `CPF_ENCRYPTION_KEY` (env)
- Useful quando CPF precisa ser exibido de volta para o aluno

### Opção C — Hash irreversível + últimos 3 dígitos
- Armazenar `cpfHash` (SHA-256 + salt fixo) e `cpfLast3` (para identificação visual)
- Migration de dados: gerar hash dos existentes
- Útil para verificação ("é você?") sem permitir leitura

**Critério de pronto:** Decisão registrada em ADR (`docs/adr/0001-cpf-handling.md`) + implementação correspondente.

---

## Tarefa 3.6 — Aviso de coleta de CPF (se mantido)

**Arquivo a editar:** Onde quer que o CPF seja capturado (formulário de cadastro/perfil)

**Adicionar abaixo do input:**
> "Seu CPF é coletado com base no legítimo interesse (art. 7º, IX, LGPD) para identificação interna. Você pode solicitar sua exclusão a qualquer momento."

---

# Dependências e ordem de execução

```
Sprint 1 (independente)
   │
   ▼
Sprint 2.1 (cascades) ──► Sprint 2.2 (hard delete admin)
                       └► Sprint 2.3 (autodeleção) ──► Sprint 2.4 (UI)
   │
   ▼
Sprint 3.1 (export) ──► Sprint 3.2 (UI)
Sprint 3.3 (política docs) ──► Sprint 3.4 (job retenção)
Sprint 3.5 (decisão CPF) ──► Sprint 3.6 (aviso)
```

**Bloqueadores críticos:**
- Sprint 2.2 e 2.3 **dependem** de 2.1 (sem `onDelete: SetNull`, hard delete quebra)
- Sprint 3.6 **depende** da decisão tomada em 3.5

---

# Estimativa de esforço

| Sprint | Tarefas | Esforço |
|---|---|---|
| Sprint 1 | 6 tarefas | ~2 dias úteis |
| Sprint 2 | 5 tarefas | ~3 dias úteis |
| Sprint 3 | 6 tarefas | ~4 dias úteis |
| **Total** | **17 tarefas** | **~9 dias úteis** |

---

# Critérios de aceitação globais

Ao final da implementação completa, a plataforma deve:
- [ ] Ter Política de Privacidade e Termos de Uso públicos e indexáveis
- [ ] Bloquear trackers até consentimento explícito do visitante
- [ ] Permitir que qualquer aluno exclua a própria conta com confirmação por senha
- [ ] Excluir efetivamente (hard delete) os dados do banco em cascata
- [ ] Permitir que o aluno baixe um JSON com 100% dos seus dados
- [ ] Ter canal `privacidade@operacao01.com.br` ativo e divulgado no rodapé
- [ ] Ter política de retenção documentada e job de limpeza em produção
- [ ] Tratar CPF de forma conforme (removido, criptografado ou hasheado)

---

# Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Hard delete acidental de admin/mentor | Bloqueio explícito no endpoint (Tarefa 2.3) + sem UI de autoexclusão |
| Export de dados expor PII de terceiros | Endpoint retorna apenas dados do `session.user.id` — nunca de terceiros |
| Job de retenção apagar dados em uso | Janela de 24 meses + log do que foi removido |
| Decisão errada sobre CPF | ADR escrito antes da implementação para auditoria |
| Banner de cookies prejudicar conversão | A/B test após deploy do Sprint 1 (opcional) |

---

*Após a implementação completa, a Política de Privacidade e os Termos de Uso devem ser revisados por advogado especializado em LGPD antes da publicação oficial.*
