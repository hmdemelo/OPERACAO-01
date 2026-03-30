# Requisitos Mestres do Registro de Modificações

## Objetivo

Garantir um registro único, rastreável e confiável das mudanças da aplicação em produção.

## Fonte Oficial

- Arquivo oficial: `CHANGELOG.md` (raiz do projeto).
- Este documento define o padrão de escrita e manutenção.

## Estrutura Obrigatória por Versão

Cada versão deve seguir a ordem:

1. `## 🚀 vX.Y.Z — DD/MM/AAAA`
2. `### ✨ Novidades`
3. `### 🔧 Melhorias`
4. `### 🐛 Correções`
5. `### 🔒 Segurança` (quando aplicável)
6. `### ⚠️ Breaking Changes` (quando aplicável)

Se uma seção não tiver itens, ela pode ser omitida.

## Regras de Conteúdo

1. Cada item deve descrever impacto real para usuário, operação ou manutenção.
2. Evitar texto genérico como "ajustes diversos".
3. Citar o módulo afetado quando possível (`Dashboard`, `Cronograma`, `Alertas`, `Auth`).
4. Registrar comportamentos alterados, não apenas refatorações internas.
5. Alterações em produção devem entrar no changelog no mesmo ciclo de deploy.

## Regras de Governança

1. Sempre manter uma seção de trabalho no topo:
   - `## 🚧 Unreleased`
2. Antes do deploy:
   - Consolidar itens de `Unreleased`.
   - Converter para versão com data.
3. Não remover histórico antigo.
4. Não reescrever versões já publicadas, exceto para correções factuais.

## Checklist de Publicação

1. Mudança foi validada em ambiente de homologação.
2. Impacto da mudança foi descrito de forma objetiva.
3. Itens agrupados por categoria (novidade, melhoria, correção).
4. Data e versão preenchidas no padrão.
5. Revisão final de consistência com o código.
