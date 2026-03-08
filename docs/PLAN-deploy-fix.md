# Plano de Correção Definitiva: Deploy Vercel

## Visão Geral
O projeto está falhando no deploy Linux (Vercel) porque referências ao compilador SWC de macOS continuam no arquivo `package-lock.json`. O objetivo é purgar essas referências e garantir um build limpo.

## Tipo do Projeto
**WEB** - Next.js (App Router)

## Critérios de Sucesso
- `package-lock.json` sem nenhuma menção a `darwin` ou `win32`.
- Deploy Vercel passando da fase de "Installing Dependencies".
- URL de produção ativa com dados do Supabase.

---

## 📋 Breakdown de Tarefas

### Tarefa 1: Auditoria e Purgas de Lockfile (Fase de "Terra Arrasada")
- **Agent**: `devops-engineer`
- **Passos**:
  1. Deletar `package-lock.json` e `node_modules` localmente.
  2. Gerar um novo lockfile limpíssimo.
  3. Executar script de remoção forçada em modo "agressivo" (removendo `optionalDependencies` que o npm insere automaticamente por estarmos no Mac).
- **INPUT**: Lockfile atual. → **OUTPUT**: Novo `package-lock.json` sem referências cruzadas. → **VERIFY**: `grep "darwin" package-lock.json` deve retornar vazio.

### Tarefa 2: Ajuste de Configuração Next.js
- **Agent**: `frontend-specialist`
- **Passos**:
  1. Verificar se há alguma flag no `next.config.ts` forçando o uso do SWC binário de forma manual.
  2. Garantir que o `prisma` esteja gerando o cliente corretamente para ambiente `debian-openssl-3.0.x` (padrão Vercel).
- **INPUT**: `next.config.ts`. → **OUTPUT**: Arquivo otimizado para build agnóstico. → **VERIFY**: Build local de teste.

### Tarefa 3: Deploy e Validação de Variáveis
- **Agent**: `devops-engineer`
- **Passos**:
  1. Fazer o commit com `[skip ci]` se necessário para limpar o histórico e então um push final.
  2. Monitorar o **novo** deploy disparado pelo push (não usar botão "Redeploy" em builds falhos).
- **INPUT**: Git Origin. → **OUTPUT**: Build Success Log na Vercel. → **VERIFY**: Site acessível.

---

## ✅ PHASE X: VERIFICAÇÃO FINAL
- [ ] Inexistência de `@next/swc-darwin` no repositório remoto.
- [ ] Vercel Status: Deployment Ready.
- [ ] Dashboard online carregando dados do Supabase.
