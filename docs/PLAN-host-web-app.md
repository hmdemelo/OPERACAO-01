# Plano de Implantação e Hospedagem na Web (Deploy)

## Visão Geral
Este documento define o roteiro e requisitos de como colocar a aplicação *Operação 01* no ar, detalhando a arquitetura, plataforma, banco de dados e domínios.

## Tipo do Projeto
**WEB** - Aplicação Full-Stack em Next.js (App Router) + Prisma + PostgreSQL

## Critérios de Sucesso
- Aplicação 100% funcional na web via URL HTTPS
- Backend conectado corretamente e autenticado no banco de dados de produção
- Tempo de resposta e rotas verificadas (Lighthouse Audit: Performance e Acessibilidade >= 85)
- Deploy contínuo ativado (CI/CD rodando lint no código antes do merge)

## Tech Stack (Hospedagem)
- **Frontend/Backend Serverless**: [Vercel](https://vercel.com/) (Ideal e nativo para aplicações Next.js)
- **Database (PostgreSQL PostgreSQL Prisma)**: Supabase, Neon ou Vercel Storage. Recomenda-se o **Supabase** pela robustez em serviços complementares ou **Neon DB** pelo seu modelo puramente Serverless e integração instantânea com Vercel.
- **Armazenamento de Arquivos/Imagens**: Vercel Blob ou AWS S3 (Caso precise subir grandes PDFs e imagens além do public folder).

## File Structure / Services Integrations
- `.vercel/` -> Configurações locais que ligam seu ambiente dev ao de prod.
- `prisma/schema.prisma` -> Define como o PostgreSQL opera na cloud.
- `package.json` -> Scripts de build requerem atenção (`npm run build`).

---

## 📋 Breakdown de Tarefas

### Tarefa 1: Prover o Banco de Dados de Produção
- **Agent**: `database-architect`
- **Descrição**: Atualmente estamos utilizando um DB local ou de dev (`postgresql://hugo...`). Para ir para a nuvem, precisamos de um host cloud.
- **Passos**: 
  1. Criar uma conta/projeto num serviço de Cloud DB (Recomendação: Neon.tech).
  2. Pegar a string de conexão (Connection Pooling é recomendado, ex: `postgres://user:pass@ep-blue-sky.../db`).
- **INPUT**: App necessita de database. → **OUTPUT**: URL do banco de dados na nuvem rodando Prisma migrations (`npx prisma db push`). → **VERIFY**: Tabelas do banco devem aparecer no painel remoto.

### Tarefa 2: Configurar Repositório e Variáveis de Ambiente
- **Agent**: `devops-engineer`
- **Descrição**: A Vercel (ou outro provedor) precisa de acesso ao código base para triggar o build. E precisamos proteger os as chaves privadas.
- **Passos**:
  1. Transferir variáveis críticas do arquivo `.env` local para as configurações de Secrets da plataforma Vercel. 
  2. Variáveis essenciais: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (para produção será a nova URL gerada).
- **INPUT**: Código final com `.env` ignorado no git. → **OUTPUT**: Projeto git (GitHub) conectado à plataforma de host e ENV Vars cadastradas na Vercel Cloud. → **VERIFY**: Vercel inicia deploy de forma automática num branch push.

### Tarefa 3: Executar Pre-Flight local e Build final
- **Agent**: `test-engineer`
- **Descrição**: Antes de apertarmos "Publicar" oficial, rodamos localmente as validações idênticas ao container Linux da Cloud.
- **Passos**:
  1. Rodar pipeline local: Typescript check (`tsc --noEmit`)
  2. Rodar ESLint.
  3. Simular build local de prod (`npm run build`).
- **INPUT**: Source codes. → **OUTPUT**: Build `.next` sem erros. → **VERIFY**: Status Exit Code 0.

### Tarefa 4: Conectar Domínio Customizado (Opcional)
- **Agent**: `devops-engineer`
- **Descrição**: Ao invés do URL padrão (ex: `operacao-01.vercel.app`), conectar seu domínio pessoal.
- **Passos**:
  1. Comprar domínio (Registro.br ou GoDaddy).
  2. Associar Nameservers ao suporte da provedora de cloud (Vercel permite adicionar o record CNAME e A via painel).
- **INPUT**: Domínio em DNS vazio. → **OUTPUT**: DNS propagado gerando SSL grátis para o site. → **VERIFY**: Acessar https://site.com resulta em tela de login segura.

---

## ✅ PHASE X: VERIFICAÇÃO FINAL

- [ ] Security Scan (Ausência de Hardcoded secrets)
- [ ] Build Vercel (Success sem falha na fase do Prisma Generate)
- [ ] Autenticação de Teste (Logar em aba anônima e ver a Dashboard online)
- [ ] Performance em Prod: Lighthouse Audit
