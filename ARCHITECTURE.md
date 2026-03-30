# Arquitetura e Roadmap do Projeto OPERAÇÃO 01

Este documento descreve o funcionamento atual da aplicação, detalhando o que realmente existe no código fonte, os padrões adotados e as metas técnicas estabelecidas para o futuro. 

---

## 1. Estado Atual: O que já existe no código

### A. Estrutura de Pastas e Rotas
A aplicação é construída utilizando o **App Router** do Next.js (versão instalada identificada como 16.1.6 no package.json).
- **`/app`**: Todas as rotas estão diretamente na raiz, sem a divisão por Route Groups (como `(app)` ou `(marketing)`).
  - `/app/admin`: Contém páginas de administração (dashboards, gestão de alunos, concuros, matriz curicular).
  - `/app/student`: Área restrita do estudante (dashboard, log de estudos, planejamento semanal).
  - `/app/signin`: Interface de Login.
  - `/app/layout.tsx`: Embrulha **toda** a aplicação com provedores essenciais: `AuthSessionProvider`, `QueryProvider` (React Query) e `ThemeProvider` (fixado unicamente no dark mode).
- **`/components`**: Componentes organizados logicamente (`admin`, `student`, `ui` via shadcn/ui, gráficos e tabelas).
- **`/lib`**: Todo o coração funcional (autenticação, acesso ao DB, bibliotecas de métricas, utils). A lógica de negócio está bem separada dos componentes de React.

### B. Banco de Dados e Modelos (Prisma/PostgreSQL)
O schema do Prisma centraliza regras de negócio complexas. As principais entidades são:
- ***Usuários e Vínculos:*** A tabela `User` concentra acessos e perfis (`Role`: `ADMIN`, `STUDENT`, `MENTOR`). Contas de Mentores e Estudantes são amarradas pela tabela pilar `MentorshipLink`.
- ***Core do Sistema (Logs de Estudo):*** Baseado nas entidades `StudyLog` (registra a data, horas dedicadas, quantidade de questões feitas e acertos) e suas chaves vinculadas `Content` e `Subject` (Matérias). O histórico de mudanças nisso é salvo em `StudyLogHistory`.
- ***Planejamento:*** Entidades robustas para guiar os estudos diários do usuário: `WeeklyPlan` e `WeeklyPlanItem`. Inclui o recurso de recálculo dinâmico preditivo para atrasos (`/api/student/plan/recalculate`).
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
2. **Otimizações no Cache de Métricas por meio de ISR**:
   O sistema de cache engatilhada em cima das queries monstruosas de ranking tem de passar e amadurecer a sua política para *Incremental Static Regeneration*, gerando dashboards atualizados instantaneamente em tempo previsíveis para o admin poupando tempo em instâncias concorrentes.
3. **Isolamento Total do `use client` nas partes Interativas**: 
   Atualmente provedores vitais abraçam o `layout.tsx` inteiro, fazendo o Next lidar de maneira generalista sob as renderizações de cliente. É essencial mover e especializar componentes de botão e tabelas unicamente onde eles precisam aparecer como cliente.
