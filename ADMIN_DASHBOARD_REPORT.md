# Orquestração do Admin Dashboard

## 1. Visão Geral

Este relatório consolida as implementações realizadas no painel Admin (dashboard), incluindo a estrutura unificada, componentes extraídos, caches para desempenho e gestão de permissões para Mentores.

## 2. Unificação de Papéis (Admin & Mentor)

- **Desafio:** A aplicação contava com duplicidade de painéis (Admin Dashboard vs Mentor Dashboard). O código da página, as chamadas a métricas de banco e os componentes não estavam aproveitando o conhecimento do sistema em sua totalidade, gerando manutenibilidade complexa.
- **Implementação:** Foi consolidado o acesso e renderização no caminho de rotas `/app/admin/dashboard`. Agora, o código extrai o papel (`role`) da sessão (`session.user.role`).
- **Lógica Condicional:** Se o `userRole === "MENTOR"`, os dados de banco são puxados via `mentorId` (que passa a restringir o escopo dos alunos aos do Mentor), omitindo outras visões se não configurado. Adicionalmente, inserimos a funcionalidade de alternar (toggle) os painéis/widgets no "Mentor Dashboard". O Admin acessa e visualiza a tabela geral e configurações.

## 3. Extração e Componentização (Clean Code)

Todos os painéis densos do Dashboard foram devidamente componentizados e movidos para `/components/admin/dashboard/`:
1. `DashboardKpiCards`: Cards de agregação.
2. `DashboardInsightsPanel`: Painel unificado de inteligência, com abas de risco preditivo (`/api/admin/alerts`) e alertas operacionais do período.
3. `DashboardSubjectChart` e `DashboardEvolutionChart`: Gráficos de barra usando Recharts para Evolução de Engajamento e Matérias.
4. `DashboardStudentRow`: Fragmento contendo a linha lógica e os metadados do `Table` base para exibição de cada aluno.
5. `DashboardPagination`: Centralização da navegação (Server-Side Pagination via Search Params).

Dessa forma, a página base (`app/admin/dashboard/page.tsx`) age apenas como container agregador e servidor de dados (React Server Component).

## 4. Otimização e Cache (Performance Profiling)

Visando reduzir carga de banco, implementamos a biblioteca dedicada `lib/metrics/cachedAdminMetrics.ts`:
- Funções como `getCachedDashboardSummary`, `getCachedSubjectDistributionAll`, `getCachedWeeklyEvolution` trazem um sistema unificado.
- **Estratégia Backend:** Utiliza-se a função nativa `unstable_cache` do Next.js aliada ao uso de tags. O cache varia por `mentorId` e `period` onde aplicável, reduzindo consultas repetidas em reloads consecutivos.
- **Observação importante:** No estado atual do código, os `revalidate` configurados estão em 1h e 2h (apesar dos nomes das constantes sugerirem 5 e 10 minutos). Além disso, o filtro de período exposto no Dashboard é `week`, `fortnight` e `all`.

## 5. Personalizações Dinâmicas no Dashboard (Widgets e Alertas)

Implementamos um controle customizado acessível em `/app/admin/settings/page.tsx` para configurar a visibilidade dos blocos dinâmicos do Dashboard de forma sistêmica (afetando tanto Admins quanto Mentores):
- Os widgets configuráveis atualmente incluem: (a) Kpi Cards, (b) Painel de Inteligência e Alertas (`system_alerts`), (c) Gráfico de Matérias, (d) Gráfico de Evolução e (e) Tabela de Desempenho (Ranking).
- No estado atual, não há toggle separado para "Risk Alerts" e "System Alerts": ambos estão consolidados no `DashboardInsightsPanel` sob a chave `system_alerts`.
- Diferente da concepção original voltada estritamente para Mentores, a configuração agora comanda integralmente o layout do Dashboard, permitindo que o administrador silencie painéis e reduza ruído com flexibilidade imediata para qualquer perfil autorizado.

## 6. Próximos Passos (Tech Debt & Roadmap)

1. Monitorar o acesso de banco com a estratégia atual de caches. Se os alunos engajarem intensamente, considerar rotinas CRON dedicadas salvando estatísticas processadas diariamente em tabelas estáticas do próprio banco de dados, em vez do unstable_cache Next.js.
2. Explorar Revalidação On-Demand em eventos críticos: no momento o Next.js lida através do cache TTL do `unstable_cache`, o que acarreta possivelmente alguns minutos de visualização atrasada não imediata (Aceitável pelo nível de relatórios analíticos do MVP).
3. Testes End-to-End no Dashboard: Como há personalização profunda de visualização por "roles" (Admin vs Mentor), construir tests E2E via Playwright para auditar as restrições visíveis perfeitamente.
