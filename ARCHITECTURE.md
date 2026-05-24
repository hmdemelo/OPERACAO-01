# Arquitetura e Roadmap do Projeto OPERAÇÃO 01

Este documento descreve o funcionamento atual da aplicação, detalhando o que realmente existe no código fonte, os padrões adotados e as metas técnicas estabelecidas para o futuro. 

---

## 1. Estado Atual: O que já existe no código

### A. Estrutura de Pastas e Rotas
A aplicação é construída utilizando o **App Router** do Next.js (versão instalada identificada como 16.1.6 no package.json).
- **`/app`**: Todas as rotas estão diretamente na raiz, sem a divisão por Route Groups (como `(app)` ou `(marketing)`).
  - `/app/admin`: Contém páginas de administração (dashboards, gestão de alunos, concursos, matriz curricular, gestão de questões).
  - `/app/student`: Área restrita do estudante (dashboard, log de estudos, planejamento semanal, banco de questões da semana).
  - `/app/signin`: Interface de Login.
  - `/app/layout.tsx`: Embrulha **toda** a aplicação com provedores essenciais: `AuthSessionProvider`, `QueryProvider` (React Query) e `ThemeProvider` (fixado unicamente no dark mode).
- **`/components`**: Componentes organizados logicamente (`admin`, `student`, `ui` via shadcn/ui, gráficos e tabelas).
- **`/lib`**: Todo o coração funcional (autenticação, acesso ao DB, bibliotecas de métricas, utils, IA). A lógica de negócio está bem separada dos componentes de React.

### B. Banco de Dados e Modelos (Prisma/PostgreSQL)
O schema do Prisma centraliza regras de negócio complexas. As principais entidades são:
- ***Usuários e Vínculos:*** A tabela `User` concentra acessos e perfis (`Role`: `ADMIN`, `STUDENT`, `MENTOR`). Contas de Mentores e Estudantes são amarradas pela tabela pilar `MentorshipLink`. O campo `showAnsweredQuestions` (booleano, padrão `false`) controla a visibilidade de questões já respondidas na área do aluno.
- ***Core do Sistema (Logs de Estudo):*** Baseado nas entidades `StudyLog` (registra a data, horas dedicadas, quantidade de questões feitas e acertos) e suas chaves vinculadas `Content` e `Subject` (Matérias). O histórico de mudanças nisso é salvo em `StudyLogHistory`.
- ***Planejamento:*** Entidades robustas para guiar os estudos diários do usuário: `WeeklyPlan` e `WeeklyPlanItem`. Inclui o recurso de recálculo dinâmico preditivo para atrasos (`/api/student/plan/recalculate`).
- ***Banco de Questões:*** Entidade `Question` com status (`PENDING`, `APPROVED`, `REJECTED`), campos `stem`, `alternatives` (JSON), `correctAnswer`, `commentary`, `source`, `year`, e vínculos para `Subject` e `Content`. A tabela join `QuestionAnswer` registra quais questões cada aluno já respondeu (`@@unique([userId, questionId])`).
- ***Landing Page / Marketing:*** Várias entidades embutidas voltadas para venda e marketing: `Plan`, `FeaturedStudent`, `ChangelogEntry` e `MethodItem`.

### C. Fluxos de Autenticação
- Utiliza **NextAuth.js** (na documentação referenciada em `lib/auth/authOptions.ts`).
- Estratégia atual estritamente baseada em banco de dados interno (usando a provedora `CredentialsProvider`), armazenado através do `bcrypt` nas senhas em hash da tabela de `User`.
- Usa estratégias `JWT` pra sessões (expiração absoluta base de 1 hora) e não possui ainda implementações ativas de de Single Sign-on como (Google, Apple, Facebook).
- A permissão do painel Administrativo garante restrição baseada em "role", checando o valor direto no carregamento de páginas do Servidor `getServerSession`.

### D. Lógica de Métricas e Ranking
Centralizados na pasta `lib/metrics`. Estes arquivos realizam consultas massivas usando agregadores do Prisma (`groupBy`) e funções utilitárias do `date-fns` (sempre niveladas no fuso horário de Araguaína via `getAraguainaStartOfWeek`).
- **`adminMetrics.ts`**: Ele processa a pontuação de performance dos estudantes de forma manual em typescript. Considera:
  - **30%**: Volume de Questões de prova resolvidas (com limite no teto a 100).
  - **50%**: Precisão/Porcentagem de acertos. 
  - **20%**: Consistência de atividade com base em quantos dias únicos houve inserção nos dados.
  *Se o usuário que interroga o módulo de métricas for MENTOR, o sistema restringe o rank aos alunos presentes na referida relação `MentorshipLink`.*
- **`studentMetrics.ts`**: Destilam o acompanhamento local e individual baseado em limites restritos por semana ou quinzenas de tempo dedicado.

### E. Entendendo o Admin Dashboard e Painéis de Alertas de Risco
Localizado no `app/admin/dashboard/page.tsx`, ele funciona principalmente validando o usuário pelo lado do servidor para renderizar as métricas de forma protegida. 
- A página extrai arrays massivos consumidos através de instâncias de cache (`getCachedDashboardSummary`, `getCachedSubjectDistributionAll`).
- Anteriormente a tela era puramente montada no formato síncrono da carga no Servidor. Hoje, a arquitetura utiliza o componente Client-side **`DashboardInsightsPanel`**, que faz fetch para a rota `/api/admin/alerts` consumindo os "Alertas Preditivos de Risco" (falta de atividade, baixo aproveitamento, queda brusca no desempenho) assincronamente.
- Para o Aluno, incluímos alertas vitais pareados chamados **`LatePlanAlert`** que monitoram o status do cronograma, exibindo recomendações automáticas de replanejamento (recalculate) da semana.
- As visibilidades de widgets do Dashboard já são armazenadas em JSON no banco de dados (`SystemSettings`) por meio da chave `mentor_dashboard_widgets`, e consumidas em tempo de renderização da página.

### F. Módulo de Banco de Questões
Fluxo completo de gestão e exibição de questões de prova:

**Criação / Importação:**
- Alunos podem enviar questões individualmente via formulário (controlado pelo toggle `student_upload_enabled` em `SystemSettings`).
- Admins/Mentores podem fazer upload em lote via arquivo **CSV** (delimitador `;`) ou **JSON**. O parser (`lib/questions/bulkParser.ts`) normaliza nomes de colunas em PT/EN, valida campos obrigatórios e tenta associar automaticamente `Subject` e `Content` pelo nome. Todas as questões importadas chegam com status `PENDING`.

**Revisão (Admin/Mentor):**
- A tela de revisão (`app/admin/questions`) lista questões pendentes. O card de revisão (`QuestionReviewCard`) permite clicar nas alternativas para selecionar a correta, editar o comentário em textarea e acionar o botão **"Auxílio de IA"** (`/api/admin/questions/[id]/suggest`), que chama `lib/ai/questionAnalyzer.ts` e retorna sugestão de resposta e comentário sem persistir. Os campos preenchidos pela IA ficam destacados em âmbar. O mentor pode aprovar (com `correctAnswer` obrigatório) ou rejeitar.

**Exibição para o Aluno:**
- `QuestionBankSection` (`components/student/QuestionBankSection.tsx`) busca em `/api/student/questions` as questões aprovadas das matérias do plano semanal vigente, agrupadas por disciplina.
- O aluno pode marcar cada questão como **"Questão respondida"** (checkbox), que registra um `QuestionAnswer` e oculta a questão da lista por padrão.
- A preferência **"Exibir questões respondidas"** no perfil do aluno (aba Acadêmico → `PreferencesCard`) persiste em `User.showAnsweredQuestions` via `/api/user/preferences`.
- Heurística `shouldShowSource`: o campo `source` é exibido apenas se não parecer um nome de arquivo (sem extensões de imagem/PDF nem separadores de caminho).

### G. Conformidade LGPD (Lei 13.709/2018)

Implementação completa em 3 sprints (2026-05-24). Referência: [`LGPD.md`](LGPD.md).

- **Consentimento de cookies** — `lib/cookieConsent.ts` usa `useSyncExternalStore`; `CookieBanner.tsx` bloqueia `MarketingScripts` até aceite explícito. Decisão persiste em `localStorage` com timestamp e versão da política.
- **Política de Privacidade v1.1** — `app/privacidade/page.tsx` (estática, indexável). Versão controlada via `POLICY_VERSION` em `cookieConsent.ts`.
- **Autodeleção pelo titular** — `DELETE /api/user/account`: verifica senha via bcrypt, bloqueia ADMIN/MENTOR, hard delete em cascade. UI: `DangerZoneCard` no perfil do aluno.
- **Portabilidade de dados** — `GET /api/user/export`: JSON com todos os dados do titular (sem `passwordHash`); header `Content-Disposition: attachment`. UI: `PrivacyCard` no perfil do aluno.
- **Retenção de auditoria** — `StudyLogHistory` retido por 24 meses; cron mensal (`0 3 1 * *` em `vercel.json`) chama `POST /api/admin/maintenance/cleanup-history`, protegido por `CRON_SECRET`.
- **Cascades corretos** — `Question.uploadedBy` e `approvedBy` + `StudyLogHistory.changedBy` com `onDelete: SetNull` (questões e histórico sobrevivem à exclusão do usuário).
- **CPF removido** — campo excluído do schema, APIs e formulários (migration `20260524400000_lgpd_remove_cpf`).

### H. Integração com IA
Configurável via painel admin master (`/admin/master`) através das chaves `ai_provider`, `ai_model` e `ai_api_key` em `SystemSettings`. Providers suportados:
- **Anthropic** (`@anthropic-ai/sdk`) — modelos Claude (ex: `claude-opus-4-7`)
- **OpenAI** (`openai`) — modelos GPT (ex: `gpt-4o`)
- **Google Gemini** (`@google/genai`) — modelos Gemini (ex: `gemini-2.0-flash`)

O módulo `lib/ai/questionAnalyzer.ts` abstrai o provider configurado e expõe a função `enrichQuestion`, chamada pelo endpoint `/api/admin/questions/[id]/suggest` para sugestão de gabarito e comentário.

---

## 2. Decisões de Arquitetura Contemporâneas (Por quê?)

1. **Separação de Métricas do "UI" (Server Components sobre Prisma)**:
   Métricas pesadas estão separadas no diretório `lib/`. Fazer cálculos como pontuação agregada, porcentagens e cruzamentos de atividades no Client side resultaria em envios de centenas de Mbs em JSON via TTP. Executar agregadores unicamente no ServerComponent protege os recursos do servidor e previne memory-leaks do lado do cliente.
2. **Next Auth e Jwt vs. Database Session**: A tomada de opção pela arquitetura em JWT confere mais agilidade entre re-load pages (pois o token reside no cookie e a consulta é lida criptografada direto na memória RAM, poupando consultas pesadas no PostgreSQL para conferência logada).
3. **Tailwind e shadcn/ui**: Permite isolamento severo de CSS global e consistência, criando um padrão rígido e reutilizável pelo projeto inteiro sem adicionar pacotes externos desnecessariamente pesados e suscetíveis a quebras futuras npm (MUI/Antd, por ex).
4. **Tema Engessado (Dark Mode Fixo)**: Evita flash indesejado em builds SSR ou layout-shifts baseados em requisições demoradas do React pela averiguação do tema preferido real do usuário em navegadores diferentes.

---

## 3. Roadmap Técnico (Metas Futuras - Não implementadas)

Os itens a seguir são partes planejadas documentadas previamente que visam maximizar a sustentabilidade e performatividade do sistema, mas que **ainda não estão em vigor** no código atual.

1. **Separação Abstrata de Contexto (Route Groups `(marketing)` e `(app)`)**:
   Atualmente, visitantes desconectados que entram na "Homepage" baixam provedores React do Admin Panel inteiro.
   - *Meta*: Segregar as pastas das sessões restritas das sessões de vitrine/Landing Page para não forçarem carregamento do `AuthSessionProvider` ou `QueryProvider` para quem sequer logou no site.
2. ~~**Otimizações no Cache de Métricas por meio de ISR**~~ ✅ **Concluído**: ISR implementado para a landing page (`revalidate = 3600`) e revalidação on-demand para dashboards via `revalidateTag`.
3. **Isolamento Total do `use client` nas partes Interativas**: 
   Atualmente provedores vitais abraçam o `layout.tsx` inteiro, fazendo o Next lidar de maneira generalista sob as renderizações de cliente. É essencial mover e especializar componentes de botão e tabelas unicamente onde eles precisam aparecer como cliente.
4. **Paginação / Filtros no Banco de Questões**:
   Conforme o volume de questões cresce, a rota `/api/student/questions` retorna o conjunto completo das matérias da semana sem paginação. Adicionar filtros por matéria, ano e paginação cursor-based melhorará a performance e a UX.
5. **Histórico de Revisões de Questões**:
   Atualmente a aprovação/rejeição não registra quem agiu nem quando. Adicionar campos `approvedById`, `approvedAt`, `rejectedById`, `rejectedAt` à entidade `Question` viabiliza auditoria e rastreabilidade.

> **Nota:** Conformidade LGPD não está no roadmap pois foi **concluída integralmente em 2026-05-24** (ver seção G acima).
