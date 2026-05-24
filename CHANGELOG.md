# Mural de Atualizações

Acompanhe as novidades e melhorias da plataforma.

---

## 🚧 Unreleased

### 🐛 Correções
- **Cronograma semanal (Admin/Mentor)** — Corrigido problema em que salvar alterações no cronograma podia resetar blocos já concluídos pelo aluno. O salvamento agora preserva itens existentes e seus estados de conclusão ao adicionar novos blocos.

### 🔧 Melhorias
- **Persistência de plano semanal** — Atualizado fluxo de gravação para estratégia diferencial (atualiza existentes, cria novos e remove apenas blocos realmente excluídos), reduzindo risco de inconsistências em `completed`, `studyLogId` e métricas associadas.
- **Dashboard de alertas** — Consolidada a abordagem de alertas na Central de Inteligência (`DashboardInsightsPanel`), unificando alertas preditivos e alertas de período no mesmo painel.

---

## 🔐 v1.5.0 — 24/05/2026 — Conformidade LGPD

### 🛡️ Privacidade e Proteção de Dados

- **Política de Privacidade** — Nova página `/privacidade` (v1.1) com inventário completo de dados, bases legais, direitos do titular e canal DPO (`privacidade@operacao01.com.br`).
- **Termos de Uso** — Nova página `/termos` com condições de uso, propriedade intelectual e foro de Araguaína/TO.
- **Banner de consentimento de cookies** — Rastreadores (Facebook Pixel, Google Tag Manager) agora carregam **somente após aceite explícito**. Decisão persiste entre sessões com timestamp e versão da política.
- **Exportação de dados (portabilidade)** — Alunos podem baixar um JSON com 100% dos seus dados pessoais diretamente do perfil (art. 18, V da LGPD).
- **Exclusão de conta pelo titular** — Alunos podem excluir a própria conta com confirmação por senha. A exclusão é definitiva (hard delete) e remove em cascata logs, grade, plano semanal, simulados e respostas (art. 18, VI da LGPD).
- **Remoção do campo CPF** — Campo removido do banco de dados, formulários e APIs. A plataforma não coleta mais CPF (princípio da minimização — art. 6º, III da LGPD).
- **Retenção de auditoria** — Histórico de edições de logs (`StudyLogHistory`) retido por no máximo 24 meses. Job de limpeza automático executa todo dia 1º do mês.

### 🔧 Melhorias técnicas

- **Cascades corrigidos** — Exclusão de usuário não quebra mais integridade referencial: questões e histórico de auditoria permanecem com vínculo nulo (`uploadedBy = NULL`) em vez de bloquear a exclusão.
- **Hard delete** — Endpoint de exclusão de usuários pelo admin convertido de soft delete para exclusão real.
- **Rodapé atualizado** — Links para `/privacidade`, `/termos` e canal de privacidade adicionados ao rodapé da landing page.

---

## 🚀 v1.4.0 — 01/03/2025

### ✨ Novidades
- **Dashboard Completo** — O painel do admin e mentor agora conta com KPI Cards, gráficos e aderência ao cronograma.
- **KPI Cards** — 5 indicadores no topo: Total de Alunos, Precisão Média, Horas Totais, Engajamento e Questões.
- **Painel de Alertas** — Alunos sem atividade, com precisão baixa ou baixa atividade são destacados automaticamente com links diretos para o perfil.
- **Gráfico Horas por Matéria** — Visualize a distribuição de horas de estudo por disciplina.
- **Gráfico Evolução Semanal** — Acompanhe a tendência de questões, horas e precisão das últimas 4 semanas.
- **Aderência ao Cronograma** — Veja o progresso de cada aluno no plano semanal com barras de progresso e status.

### 🔧 Melhorias
- **Edição de perfil centralizada** — A edição de perfis de admin e mentor agora ocorre exclusivamente pela seção Usuários.
- **Remoção do link Perfil** — Removido dos menus laterais de admin e mentor para evitar duplicidade.

---

## 🚀 v1.3.0 — 01/03/2025

### ✨ Novidades
- **Mural de Atualizações** — Esta página! Agora você pode acompanhar todas as novidades da plataforma.
- **Vinculação de Matérias no Cronograma** — Mentores podem vincular suas matérias aos alunos diretamente pela visão de cronogramas (botão 📚).
- **Filtro de Matérias por Mentor** — O seletor de matérias no editor de cronograma mostra apenas as matérias habilitadas do mentor.

### 🔒 Segurança
- Mentores não têm mais acesso aos dados pessoais dos alunos.
- Perfil do Mentor restrito a: Dashboard, Cronograma e Perfil.

### 🐛 Correções
- Corrigido erro 400 ao salvar perfil de mentor (validação de role).
- Corrigido erro 401 ao mentor salvar cronograma.
- Corrigida vinculação de aluno-mentor na criação e edição de usuários.

---

## 🚀 v1.2.0 — 28/02/2025

### ✨ Novidades
- **Role de Mentor** — Novo perfil de usuário com acesso restrito.
- **Dashboard filtrado** — Mentores veem apenas os dados dos seus alunos.
- **Portfólio Acadêmico** — Mentores gerenciam suas matérias e concursos.
- **Vinculação Aluno-Mentor** — Admin vincula alunos a mentores específicos.

---

## 🚀 v1.1.0 — 27/02/2025

### ✨ Novidades
- **Cronograma Semanal** — Editor visual de planos semanais para alunos.
- **Visão de Cronogramas** — Painel com progresso de todos os alunos.
- **Concursos** — CRUD completo para gerenciamento de concursos.

---

## 🚀 v1.0.0 — 25/02/2025

### 🎉 Lançamento Inicial
- Dashboard administrativo com métricas.
- Gerenciamento de usuários (CRUD).
- Gerenciamento de matérias e conteúdos.
- Sistema de autenticação com NextAuth.
- Landing page institucional.
