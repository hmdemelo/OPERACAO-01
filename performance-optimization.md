# Plano de Otimização de Performance

## Visão Geral
Uma estratégia abrangente e plano de execução para abordar os gargalos de Performance de maior prioridade identificados na aplicação Next.js. O foco é reduzir o overhead de SSR em páginas públicas, isolar Client Components para otimizar o Bundle size, implementar ISR, realizar o Lazy-loading de dependências pesadas de gráficos e refatorar padrões de Data fetching em CSR de baixo desempenho para Server Components.

## Tipo de Projeto
WEB

## Critérios de Sucesso
- A página inicial pública (`/`) é gerada estaticamente com ISR (evitando SSR em cada requisição).
- O redirecionamento de usuários logados é movido para o Edge Middleware.
- O Root layout utiliza Route Groups (`(marketing)` e `(app)`) para garantir que as páginas públicas não carreguem Providers de estado pesados (AuthSession, Query, Theme).
- O Payload total de Javascript para a Landing page diminui significativamente através da eliminação de blocos globais de `"use client"` e Otimização de Imagem adequada (`next/image`).
- A Performance do Admin melhora com o Lazy-loading do `recharts` e a migração de buscas via `useEffect` no cliente para buscas em Server Components.
- Sem Hydration mismatches relacionados a `new Date()`.

## Tech Stack
- Next.js 14/15 (App Router, Server Components, Route Groups)
- Edge Middleware (Next.js Middleware)
- next/image & next/dynamic
- Prisma (Queries de banco de dados e otimização com `Promise.all`)

## Mudanças Necessárias na Estrutura de Arquivos
```text
app/
├── (marketing)/
│   ├── layout.tsx       # Layout leve, sem Context Providers
│   └── page.tsx         # Landing page estática com ISR
├── (app)/
│   ├── layout.tsx       # Layout autenticado com todos os Providers
│   ├── admin/
│   └── student/
├── middleware.ts        # Criado/Atualizado para redirecionamento de autenticação no Edge
├── next.config.ts       # Atualizado com remotePatterns e formatos
```

## Detalhamento das Tarefas

### Tarefa 1: Target Route Groups & Isolamento de Providers
- **agent**: `frontend-specialist`
- **skills**: `react-best-practices`, `frontend-design`
- **prioridade**: P0 (Bloco Fundamental)
- **dependências**: Nenhuma
- **ENTRADA**: `app/layout.tsx`, `app/page.tsx`, `app/admin/*`, `app/student/*`
- **SAÍDA**: Implementação dos Route Groups `(marketing)` e `(app)`. Mover `AuthSessionProvider`, `QueryProvider`, etc., para `(app)/layout.tsx`. Limpar o Root layout.
- **VERIFICAÇÃO**: Visitas anônimas às Landing pages carregam menos Providers; as rotas em `(app)` mantêm os comportamentos de Session e Query.

### Tarefa 2: Redirecionamento de Auth no Edge Middleware
- **agent**: `backend-specialist`
- **skills**: `nodejs-best-practices`
- **prioridade**: P1
- **dependências**: Tarefa 1
- **ENTRADA**: `middleware.ts`, `app/(marketing)/page.tsx`
- **SAÍDA**: O Middleware intercepta a rota `/` e redireciona usuários autenticados de forma transparente. Remoção de chamadas de `getServerSession` da Landing page.
- **VERIFICAÇÃO**: Usuário autenticado acessa `/` e é imediatamente redirecionado para o dashboard sem invocação de SSR.

### Tarefa 3: Landing Page ISR & Paralelização de Queries no DB
- **agent**: `backend-specialist`
- **skills**: `prisma-expert`, `react-best-practices`
- **prioridade**: P1
- **dependências**: Tarefa 2
- **ENTRADA**: `lib/landing.ts`, `app/(marketing)/page.tsx`
- **SAÍDA**: Refatorar 4 Queries sequenciais de banco de dados para `Promise.all`. Ativar ISR com `export const revalidate = 300` ou envolver em `unstable_cache`.
- **VERIFICAÇÃO**: O TTFB diminui. O banco de dados recebe apenas 1 bloco de execução paralela por janela de Revalidation.

### Tarefa 4: Restrição de Client Components & Otimização de Imagem
- **agent**: `frontend-specialist`
- **skills**: `react-best-practices`
- **prioridade**: P1
- **dependências**: Tarefa 1
- **ENTRADA**: `components/landing/LandingPage.tsx`, `components/landing/FeaturedStudents.tsx`, `next.config.ts`
- **SAÍDA**: Remover `"use client"` de alto nível em `LandingPage.tsx`. Isolar a interatividade nos nós folha (leaf nodes). Refatorar `<img>` para `<Image>` com `remotePatterns` corretos e `formats: ['image/avif', 'image/webp']` na configuração.
- **VERIFICAÇÃO**: O Bundle size de JS para a Landing page é minimizado. Imagens servidas em formatos de nova geração.

### Tarefa 5: Lazy Load de Gráficos no Admin
- **agent**: `frontend-specialist`
- **skills**: `react-best-practices`
- **prioridade**: P2
- **dependências**: Nenhuma
- **ENTRADA**: `components/admin/dashboard/DashboardSubjectChart.tsx`, `components/admin/dashboard/DashboardEvolutionChart.tsx`
- **SAÍDA**: Usar `next/dynamic` para importar componentes pesados e dinâmicos do `recharts`. Garantir `ssr: false` e renderizar um Skeleton template rápido.
- **VERIFICAÇÃO**: O Payload inicial da página do dashboard não inclui o `recharts`.

### Tarefa 6: Migrar CSR Fetching para Server Components
- **agent**: `frontend-specialist`
- **skills**: `react-best-practices`
- **prioridade**: P2
- **dependências**: Tarefa 1
- **ENTRADA**: `app/admin/landing/page.tsx`, `app/admin/concursos/page.tsx`
- **SAÍDA**: Remover a lógica de fetch contida em `useEffect`. Resolver os dados no Server-Side usando Prisma diretamente, passando os dados iniciais via Server Component.
- **VERIFICAÇÃO**: Nenhum Network waterfall na aba "Network" do navegador após carregar os caminhos do admin.

### Tarefa 7: Correções de Hydration & Atraso de Scripts de Analytics
- **agent**: `frontend-specialist`
- **skills**: `react-best-practices`
- **prioridade**: P3
- **dependências**: Nenhuma
- **ENTRADA**: `components/landing/Footer.tsx`, `app/student/log/page.tsx`, `components/landing/MarketingScripts.tsx`
- **SAÍDA**: Resolver as discrepâncias de `new Date()` (passar do servidor ou corrigir a Hydration no cliente). Converter scripts de rastreamento de `afterInteractive` para `lazyOnload` onde for adequado para otimizar o LCP.
- **VERIFICAÇÃO**: O console do React fica livre de avisos de mismatch. O LCP melhora.

## Fase X: Checklist de Verificação
- [ ] Queries de DB de raiz: Verificadas via logs/monitoramento.
- [ ] Lints: `npm run lint` passa sem violações relacionadas.
- [ ] TypeScript: `npx tsc --noEmit` passa.
- [ ] Build: `npm run build` concluído com sucesso (com geração estática bem-sucedida de `/`).
- [ ] Runtime: Cenários de E2E e caminhos do Dashboard permanecem intactos.
