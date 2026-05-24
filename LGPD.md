# LGPD — Diagnóstico e Plano de Adequação
**Plataforma:** Operação 01  
**Data:** 2026-05-24  
**Base legal de referência:** Lei 13.709/2018 (LGPD)

---

## 1. Estado Atual — Inventário de Dados

### 1.1 Dados coletados do usuário (modelo `User`)

| Campo | Tipo | Sensibilidade | Base Legal Proposta |
|---|---|---|---|
| `name` | Texto | Baixa | Execução de contrato (art. 7º, V) |
| `email` | Texto | Média | Execução de contrato (art. 7º, V) |
| `passwordHash` | Hash BCrypt | Média | Execução de contrato (art. 7º, V) |
| `phone` | Texto | Média | Execução de contrato (art. 7º, V) |
| `cpf` | Texto (claro) | **Alta — dado sensível** | Legítimo interesse + consentimento explícito (art. 11, II) |
| `birthDate` | Data | Média | Execução de contrato (art. 7º, V) |
| `addressCity` / `addressState` | Texto | Baixa | Legítimo interesse (art. 7º, IX) |
| `targetExam` | Texto | Baixa | Execução de contrato (art. 7º, V) |
| `educationLevel` | Texto | Baixa | Execução de contrato (art. 7º, V) |
| `notes` | Texto livre (mentor) | Média | Legítimo interesse (art. 7º, IX) |
| `dailyHours` | Número | Baixa | Execução de contrato (art. 7º, V) |

### 1.2 Dados comportamentais coletados

| Dado | Onde armazenado | Retenção atual | Risco |
|---|---|---|---|
| Logs de estudo (`StudyLog`) | Banco de dados | Indefinida | Médio |
| Respostas de questões (`QuestionAnswer`) | Banco de dados | Indefinida | Baixo |
| Grade de estudos (`StudyGrid`, `StudyBlock`) | Banco de dados | Indefinida | Baixo |
| Simulados (`Simulation`, `SimulationBlock`) | Banco de dados | Indefinida | Baixo |
| Histórico de edições de log (`StudyLogHistory`) | Banco de dados | Indefinida | Baixo |

### 1.3 O que NÃO é coletado (positivo)
- Endereço IP: **não armazenado no banco**
- User Agent: **não armazenado no banco**
- Cookies de sessão: JWT HTTP-only com expiração de 1 hora
- OAuth de terceiros: **não utilizado** (apenas credenciais próprias)
- SDKs de telemetria remota (Sentry, Datadog, LogRocket): **não instalados**

---

## 2. Diagnóstico por Área

### 2.1 Governança e Transparência

**Status: ❌ Não conformidade**

**Problemas identificados:**
- Não existe página de Política de Privacidade
- Não existe página de Termos de Uso
- O CPF é coletado sem aviso de sensibilidade e sem consentimento explícito documentado
- O rodapé não contém informações do controlador de dados nem canal de privacidade
- O campo `notes` (anotações do mentor sobre o aluno) não tem nenhuma política de retenção ou visibilidade para o titular

**Ações requeridas:**
1. Criar `/privacidade` com Política de Privacidade completa
2. Criar `/termos` com Termos de Uso
3. Adicionar ao rodapé: canal de contato de privacidade (`privacidade@operacao01.com.br`)
4. Adicionar aviso de coleta de CPF no formulário de cadastro/perfil com base legal explícita
5. Adicionar links para `/privacidade` e `/termos` no rodapé e no fluxo de cadastro

---

### 2.2 Gestão de Consentimento (Cookies e Rastreamento)

**Status: ❌ Violação crítica**

**Problemas identificados:**
- Facebook Pixel carrega incondicionalmente (se `fbPixelId` estiver configurado nas SystemSettings)
- Google Tag Manager carrega incondicionalmente (se `gtmId` estiver configurado)
- Nenhum banner de consentimento existe na plataforma
- Não há bloqueio prévio dos scripts de rastreamento
- Não há registro de consentimento do usuário

**Localização do problema:**
- `components/landing/MarketingScripts.tsx` — scripts carregados com `strategy="afterInteractive"` sem verificação de consentimento
- `app/page.tsx` — renderiza `<MarketingScripts />` sem nenhuma guarda

**Ações requeridas:**
1. Implementar banner de cookies com opt-in real na landing page
2. Condicionar o carregamento de `<MarketingScripts />` ao estado de consentimento
3. Persistir a decisão do usuário em `localStorage` (chave: `cookieConsent`)
4. Garantir que scripts de terceiros nunca carreguem antes do clique em "Aceitar"
5. Registrar data e versão do consentimento (para auditoria futura)

**Implementação proposta:**

```tsx
// Estado: "pending" | "accepted" | "rejected"
// Salvo em: localStorage.getItem("cookieConsent")
// Scripts carregam apenas se estado === "accepted"
```

---

### 2.3 Segurança e Engenharia de Dados

**Status: ✅ Parcialmente conforme**

**O que está correto:**
- IPs e User Agents não são armazenados no banco de dados
- Senhas são armazenadas apenas como hash BCrypt
- JWT não carrega dados sensíveis além de `id` e `role`
- Sessão expira em 1 hora (limite absoluto)

**Problema identificado:**
- O CPF é armazenado em texto claro no banco (`cpf TEXT`)
- Sem política de retenção definida para nenhum dado comportamental
- `StudyLogHistory` acumula indefinidamente — auditoria sem limite de tempo

**Ações requeridas:**
1. Avaliar necessidade do CPF: se utilizado apenas para identificação interna, considerar substituir por um identificador interno gerado
2. Se CPF for mantido: aplicar criptografia simétrica reversível (AES-256) ou hash irreversível dependendo do uso
3. Definir política de retenção para `StudyLogHistory`: sugestão de 24 meses após inatividade do usuário
4. Documentar no banco (via comentário de migration) o prazo de retenção de cada tabela sensível

---

### 2.4 Vazamento via Integrações de Terceiros

**Status: ✅ Conforme**

**Resultado da auditoria:**
- Sentry: **não instalado**
- LogRocket: **não instalado**
- Datadog: **não instalado**
- Posthog: **não instalado**
- O logger utilizado é o **Pino** (local, server-side only — nenhum dado enviado externamente)

**Único ponto de atenção:**
- Facebook Pixel e GTM, quando ativados, enviam dados comportamentais da landing page para servidores da Meta e Google. Isso é endereçado no item 2.2 com o banner de consentimento.

**Ações requeridas:**
- Nenhuma ação técnica adicional — apenas garantir que o consentimento (item 2.2) bloqueie os scripts antes da aceitação

---

### 2.5 Direitos do Titular (Autonomia do Usuário)

**Status: ❌ Não conformidade**

**Problemas identificados:**
- Não existe fluxo de exclusão de conta pelo próprio usuário
- O endpoint `DELETE /api/admin/users/[id]` realiza apenas **soft delete** (`active: false`) — os dados permanecem no banco
- O modelo `Question` tem relações `uploadedBy` e `approvedBy` sem `onDelete: Cascade` — exclusão de usuário causaria erro de FK
- O modelo `StudyLogHistory` tem relação `changedBy` sem `onDelete: Cascade`
- Não existe mecanismo de exportação de dados (portabilidade — art. 18, V)
- Não existe canal de contato para exercício de direitos do titular

**Estrutura de cascade atual no `User`:**
```
✅ MentorshipLink        — onDelete: Cascade
✅ StudyLog              — onDelete: Cascade
✅ WeeklyPlan            — onDelete: Cascade
✅ StudyGrid             — onDelete: Cascade
✅ QuestionAnswer        — onDelete: Cascade
✅ UserSubject           — onDelete: Cascade
✅ UserConcurso          — onDelete: Cascade
❌ Question.uploadedBy   — sem cascade (bloqueante)
❌ Question.approvedBy   — sem cascade (bloqueante)
❌ StudyLogHistory.changedBy — sem cascade (bloqueante)
```

**Ações requeridas:**
1. Corrigir `prisma/schema.prisma`:
   - `Question.uploadedBy` → `onDelete: SetNull` (questão permanece, vínculo com usuário zerado)
   - `Question.approvedBy` → `onDelete: SetNull`
   - `StudyLogHistory.changedBy` → `onDelete: SetNull`
2. Converter `DELETE /api/admin/users/[id]` de soft delete para hard delete real (após corrigir cascades)
3. Criar endpoint `DELETE /api/user/account` — exclusão iniciada pelo próprio aluno, com confirmação por senha
4. Criar endpoint `GET /api/user/export` — exporta todos os dados do titular em JSON
5. Adicionar na área do aluno: seção "Minha Conta" com botão "Excluir minha conta" e link "Exportar meus dados"
6. Adicionar ao rodapé canal de contato: `privacidade@operacao01.com.br`

---

## 3. Resumo Executivo de Conformidade

> **Última atualização:** 2026-05-24 — todos os sprints implementados e em produção.

| Área | Status | Implementado em |
|---|---|---|
| Política de Privacidade e Termos | ✅ Conforme | Sprint 1 (commit 95d9129) |
| Consentimento para rastreamento | ✅ Conforme | Sprint 1 (commit 95d9129) |
| CPF em texto claro | ✅ Removido | Sprint 3 (commit ec0ceef) |
| Exclusão real de conta | ✅ Conforme | Sprint 2 (commit 2140f6c) |
| Cascade deletes | ✅ Conforme | Sprint 2 (commit 2140f6c) |
| Portabilidade de dados | ✅ Conforme | Sprint 3 (commit ec0ceef) |
| Política de retenção | ✅ Documentada + job ativo | Sprint 3 (commit ec0ceef) |
| Canal de privacidade (DPO) | ✅ Conforme | Sprint 1 (commit 95d9129) |
| IPs / User Agents | ✅ Conforme | — |
| SDKs de telemetria | ✅ Conforme | — |
| Hash de senha | ✅ Conforme | — |
| Expiração de sessão | ✅ Conforme | — |

---

## 4. Roadmap de Implementação

> **Status geral: ✅ CONCLUÍDO** — todos os 3 sprints implementados e em produção (2026-05-24).

### Sprint 1 — ✅ Concluído (commit 95d9129)

- [x] Criar `app/privacidade/page.tsx` com Política de Privacidade (v1.1)
- [x] Criar `app/termos/page.tsx` com Termos de Uso
- [x] Adicionar canal `privacidade@operacao01.com.br` ao rodapé
- [x] Implementar banner de cookies com opt-in na landing page (`CookieBanner.tsx`)
- [x] Bloquear carregamento de `<MarketingScripts />` antes do consentimento
- [x] Adicionar links `/privacidade` e `/termos` no rodapé e sitemap

### Sprint 2 — ✅ Concluído (commit 2140f6c)

- [x] Corrigir `prisma/schema.prisma`: `onDelete: SetNull` em Question e StudyLogHistory
- [x] Migration `20260524300000_lgpd_user_deletion_cascades` aplicada em produção
- [x] Converter soft delete em hard delete no endpoint de admin
- [x] Criar `DELETE /api/user/account` (autodeleção com verificação de senha)
- [x] Criar `DangerZoneCard` na área do aluno com dialog de confirmação

### Sprint 3 — ✅ Concluído (commit ec0ceef)

- [x] Criar `GET /api/user/export` — exportação JSON dos dados do titular
- [x] Criar `PrivacyCard` no perfil do aluno com botão "Baixar meus dados"
- [x] Documentar política de retenção em `docs/RETENCAO_DADOS.md`
- [x] Implementar cron mensal `POST /api/admin/maintenance/cleanup-history` (StudyLogHistory > 24 meses)
- [x] Configurar `vercel.json` com schedule `0 3 1 * *`
- [x] Remover campo CPF do schema, APIs, formulários e política de privacidade
- [x] Migration `20260524400000_lgpd_remove_cpf` aplicada em produção

---

## 5. Textos de Referência para Documentação Legal

### 5.1 Política de Privacidade — Estrutura Mínima

1. **Quem somos** — Identificação do controlador (razão social, CNPJ, endereço, e-mail do DPO)
2. **Quais dados coletamos** — Lista dos campos do item 1.1 acima, com finalidade de cada um
3. **Por que coletamos** — Base legal de cada dado (art. 7º ou art. 11 da LGPD)
4. **Com quem compartilhamos** — Servidores (Vercel/AWS), processadores de pagamento (se houver), Meta (Pixel), Google (GTM/Analytics) — apenas com consentimento
5. **Por quanto tempo mantemos** — Tabela de retenção por categoria de dado
6. **Seus direitos** — Confirmação, acesso, correção, anonimização, portabilidade, eliminação, revogação de consentimento (art. 18)
7. **Como exercer seus direitos** — Canal: `privacidade@operacao01.com.br`, prazo de resposta: 15 dias úteis
8. **Cookies e rastreamento** — Tipos, finalidade, como gerenciar
9. **Segurança** — Medidas técnicas adotadas (hash de senha, JWT, HTTPS, sem log de IP)
10. **Alterações nesta política** — Como o usuário será notificado
11. **Data de vigência**

### 5.2 Aviso de Coleta de CPF (formulário)

> "Seu CPF é coletado para fins de identificação e é tratado com base no legítimo interesse (art. 7º, IX, LGPD). Você pode solicitar sua exclusão a qualquer momento via privacidade@operacao01.com.br."

### 5.3 Banner de Cookies — Texto sugerido

> "Usamos cookies e pixels de rastreamento para analisar o desempenho e personalizar conteúdo. Clique em **Aceitar** para permitir ou **Recusar** para continuar sem rastreamento. [Saiba mais](/privacidade)"

---

## 6. Arquivos a Criar / Modificar

| Arquivo | Ação | Área |
|---|---|---|
| `app/privacidade/page.tsx` | Criar | Governança |
| `app/termos/page.tsx` | Criar | Governança |
| `components/landing/Footer.tsx` | Editar — adicionar e-mail e links | Governança |
| `components/landing/CookieBanner.tsx` | Criar | Consentimento |
| `app/page.tsx` | Editar — condicionamento de scripts ao consent | Consentimento |
| `components/landing/MarketingScripts.tsx` | Editar — aceitar prop `enabled` | Consentimento |
| `prisma/schema.prisma` | Editar — `onDelete: SetNull` em 3 relações | Direitos |
| `app/api/admin/users/[id]/route.ts` | Editar — hard delete | Direitos |
| `app/api/user/account/route.ts` | Criar — autodeleção | Direitos |
| `app/api/user/export/route.ts` | Criar — portabilidade | Direitos |
| `app/student/profile/page.tsx` | Editar — seção Minha Conta | Direitos |

---

*Documento gerado em 2026-05-24. Deve ser revisado por advogado especializado em LGPD antes da publicação da Política de Privacidade e dos Termos de Uso.*
