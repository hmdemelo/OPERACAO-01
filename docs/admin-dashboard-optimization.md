# Plano de Otimização: Admin Dashboard (REVISADO)

Este plano resolve o erro `P2024` (Connection Pool Timeout) e a sobrecarga de requisições identificada nos logs, combinando ajustes de infraestrutura, comportamento do cliente e cache.

## 🕵️ Fase 0: Investigação de Requisições Duplicadas (Client-Side)

Os logs mostram ~10 requisições simultâneas para `/admin/dashboard`. Precisamos identificar a causa:
1.  **Prefetch Agressivo**: Verificar se links no menu estão disparando prefetch sem necessidade.
2.  **Loops de useEffect**: Verificar se componentes no dashboard estão disparando re-renders infinitos ou múltiplos fetches.
3.  **Strict Mode**: Confirmar se o comportamento é duplicado por causa do React 18+ em desenvolvimento (embora os logs sejam de prod).

1.  **Recomendação de Configuração no Vercel**:
    *   Atualizar a variável de ambiente `DATABASE_URL` no Vercel.
    *   Aumentar o `connection_limit` de `1` para `10` (ou `20`).
    *   Confirmar o uso do Pooler do Supabase na porta `6543` (Transaction Mode) em vez de `5432`.
2.  **Ajuste no Prisma Client**:
    *   Garantir que o instanciamento no `lib/db/index.ts` está otimizado para Serverless (já parece estar, mas revisaremos).

## 🚀 Fase 2: Otimização de Backend (`lib/metrics/adminMetrics.ts`)

1.  **Consolidação de Queries**:
    *   **getWeeklyEvolution**: Reduzir para **uma única query** usando filtro de data e agrupamento manual para evitar o loop de 4 conexões.
2.  **Redução de Overfetching**: Trazer apenas IDs e campos estritamente necessários.

## ⚡ Fase 3: Implementação de Cache e Deduplicação

1.  **unstable_cache**: Envolver métricas pesadas com cache de 5-10 minutos.
2.  **Request Memoization**: Garantir que se 10 requisições chegarem ao mesmo tempo, o Next.js reuse o resultado da primeira para as demais durante o mesmo ciclo de renderização no servidor.

1.  **Criação de Camada de Cache**:
    *   Envolver as chamadas de métricas principais (`getDashboardSummary`, `getStudentPerformance`, `getSubjectDistributionAll`) em `unstable_cache`.
2.  **Estratégia de Invalidação**:
    *   Definir um `revalidate` de 300 segundos (5 minutos) por padrão.
    *   Adicionar tags corporativas (ex: `admin-metrics`) para permitir invalidação manual se necessário.

## ✅ Fase 4: Verificação e Monitoramento

1.  **Scripts de Validação**:
    *   Executar `lint_runner.py` para garantir que as mudanças seguem os padrões.
    *   Executar `lighthouse_audit.py` para medir o impacto no tempo de carregamento (LCP/TBT).
2.  **Teste de Stress Local**:
    *   Simular múltiplas conexões para verificar se o pool agora aguenta o paralelismo do `Promise.all`.

---
**Agentes Responsáveis:**
- `database-architect`: Fase 1
- `backend-specialist`: Fase 2 e 3
- `performance-optimizer`: Fase 4
