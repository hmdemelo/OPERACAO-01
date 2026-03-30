# Relatório de Viabilidade: Gestão Visual da Dashboard do Mentor

## 1. Viabilidade: É possível e viável?
**Sim, é amplamente viável e altamente recomendado.**
Omitir painéis da dashboard não apenas despolui a interface, como possibilita um **enorme ganho de performance**. Atualmente, muitos dados são buscados na inicialização da página no servidor ou via requisições cliente (como o novo painel de Alunos em Risco). Se uma configuração estiver desativada, nós nem precisaremos executar a query SQL associada (economizando CPU e latência no banco de dados e APIs).

## 2. Levantamento dos Componentes Atuais
Através da leitura do arquivo `app/admin/dashboard/page.tsx` e atualizações recentes (baseadas nas implementações do `PLAN.md`), identificamos as 7 áreas de visualização que podem ser controladas individualmente:

1. **Painéis de KPIs Gerais (`DashboardKpiCards`)**
   - Total de estudantes, média de acertos, horas totais, métricas de engajamento, questões resolvidas e total de usuários ativos.
   - *Peso da Query:* Leve/Intermediário.
2. **Painel de Alunos em Risco (`StudentsAtRiskPanel`)** *(Adicionado Recentemente)*
   - Exibe alertas críticos preditivos focados diretamente nos alunos atribuídos ao Mentor (baseado em inatividade, queda de carga e desempenho crítico). Fetch client-side em `/api/admin/alerts`.
   - *Peso da Query:* Pesado (Cruza o histórico diário de logs visando disparar os alertas).
3. **Painel de Alertas Gerais (`DashboardAlertPanel`)**
   - Contadores numéricos de alunos sem atividade recente, baixa precisão ou baixa carga na semana.
   - *Peso da Query:* Pesado (Necessita cruzar histórico granular).
4. **Distribuição por Matéria (`DashboardSubjectChart`)**
   - Gráfico de pizza/rosca sobre as matérias mais estudadas do período.
   - *Peso da Query:* Intermediário (Usa agregador/groupBy em Tópicos e Logs).
5. **Evolução Semanal (`DashboardEvolutionChart`)**
   - Gráfico de linha/barra do histórico do aluno durante os dias da semana ou quinzena.
   - *Peso da Query:* Intermediário.
6. **Aderência ao Planejamento (`DashboardScheduleAdherence`)**
   - Controle de quem tem planos semanais e cumpriu, versus os que falham.
   - *Peso da Query:* Pesado (Cruza os logs diários com o `WeeklyPlanItem`).
7. **Tabela de Performance / Top Alunos (Table + `DashboardStudentRow`)**
   - A tabela que exibe os alunos em ordem de rank, ordenável por rank, precisão cruzada, tempo de estudo etc.
   - *Peso da Query:* Pesado (Elege o rank absoluto agrupando cálculos longos).

*(A paginação `DashboardPagination` e os filtros de período estão amarrados estritamente à Tabela. A remoção da tabela ocultaria esses controles por consequência).*

---

## 3. Como pode ser feito (Arquitetura Proposta)

### Passo 1: O Modelo de Dados
Como já possuímos o modelo `SystemSettings` (key-value text) no Prisma, iremos inserir um novo parâmetro chamado `mentor_dashboard_widgets`. Seu valor (no campo `value`) manterá um objeto **JSON** simples, salvando o status Booleano (true/false) de exibição de cada bloco acima.

Exemplo do JSON salvo pelo Admin:
```json
{
  "showKpis": true,
  "showStudentsAtRisk": true,
  "showAlerts": false,
  "showSubjectChart": true,
  "showEvolutionChart": false,
  "showSchedule": false,
  "showPerformanceTable": true
}
```

### Passo 2: A Tela de Configuração do Administrador
Iremos injetar UI Switchers (também conhecidos como Toggles, na biblioteca shadcn/ui) com Rótulo e Subtítulo na página `app/admin/settings/page.tsx`.
Cada botão fará referência à uma chave do JSON (por exemplo: um card "Painel de Alunos em Risco" com um botão ativar/desativar).

### Passo 3: Rota da API (Mutação)
Uma chamada PUT ao endpoint recém-criado `app/api/admin/settings/dashboard/route.ts` receberá o JSON de configurações ajustadas pelo admin, validará (preferencialmente utilizando `Zod`) e atualizará o `SystemSettings`. Revalida-se depois o path `/admin/dashboard` para não prender a tela no cache do Next.js.

### Passo 4: Atualização Tática do `app/admin/dashboard/page.tsx`
Aqui entra o grande *"pulo do gato"*: 
Faremos o Server Component buscar essa chave específica em JSON antes das demais promessas. 
Então usamos carregamento condicional para o que é gerado no servidor e também travamos a renderização de componentes Cliente (como o `StudentsAtRiskPanel`):

```tsx
// Apenas pseudocódigo ilustrativo
const settingsJSON = await db.systemSettings.findUnique({ where: { key: "mentor_dashboard_widgets" }});
const widgets = JSON.parse(settingsJSON?.value || "{}"); // Default true p/ todos

const [summary, subjectDistribution, weeklyEvolution, scheduleAdherence] = await Promise.all([
    // Só consome o banco de dados se a opção de Tabela ou KPI ou Alerta Geral estiver ligada!
    (widgets.showKpis || widgets.showPerformanceTable || widgets.showAlerts) ? getCachedDashboardSummary(period, mentorId) : null,
    
    // Só renderiza o gráfico se ele estiver habilitado!
    widgets.showSubjectChart ? getCachedSubjectDistributionAll(period, mentorId) : null,
    // E assim em diante...
]);
```

**Para componentes Client-side (Aplica-se ao `StudentsAtRiskPanel` recém-implementado):**
```tsx
{/* Risk Alerts */}
{userRole === "MENTOR" && widgets.showStudentsAtRisk && (
    <StudentsAtRiskPanel />
)}
```
Isso transformaria o tempo de carregamento da página de algo como 2-3s (fazendo todas as queries pesadas juntas) para míseros ~100ms se o administrador deixar apenas os KPIs ativos, evitando tanto chamadas pesadas ao DB pelo Server Component quanto as chamadas de API feitas no cliente.

## Qual é sua avaliação?
Essas opções te fornecerão a clareza limpa na gestão e melhoria inquestionável de resposta do servidor (somando-se aos preditivos de Risco recém inseridos). Quer que iniciemos a inserção dos switches de imediato na tela de admin/settings?
