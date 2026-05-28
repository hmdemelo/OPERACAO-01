# Identidade Visual — Operação 01

Guia de referência para designers e desenvolvedores front-end que trabalham no projeto.

---

## 1. Visão Geral

**Operação 01** é um sistema de gestão educacional com estética militar/operacional. A interface prioriza densidade de informação, legibilidade em sessões longas e hierarquia visual clara. O modo escuro é o estado canônico — não existe suporte a light mode como intenção de uso real.

---

## 2. Stack de Design

| Camada | Biblioteca / Ferramenta | Versão |
|---|---|---|
| Componentes base | shadcn/ui (preset `default`) | — |
| Utilitários CSS | Tailwind CSS | ^3 |
| Tipografia em conteúdo rico | @tailwindcss/typography | ^0.5.19 |
| Animações utilitárias | tailwindcss-animate | ^1.0.7 |
| Ícones | lucide-react | ^0.564.0 |
| Gerenciamento de tema | next-themes | ^0.4.6 |
| Composição de classes | clsx + tailwind-merge via `cn()` | — |

> **`cn()`** está em `lib/utils.ts` e deve ser usada em todo componente para compor classes condicionais sem conflito.

---

## 3. Tipografia

### Famílias

| Papel | Família | Variável CSS |
|---|---|---|
| Sans-serif (interface) | **Geist** | `--font-geist-sans` |
| Monospace (código, dados) | **Geist Mono** | `--font-geist-mono` |

Ambas são carregadas via `next/font/google` no layout raiz com subset `latin` e aplicadas no `<body>` junto à classe `antialiased`.

### Escala (herdada do shadcn/default)

- `text-xs` — 12px — labels secundários, metadados
- `text-sm` — 14px — corpo padrão de UI, inputs, descrições
- `text-base` — 16px — corpo de conteúdo
- `text-2xl` + `font-semibold` + `leading-none` + `tracking-tight` — título de `CardTitle`

### Conteúdo rico (Markdown)

Questões, comentários e enunciados usam `react-markdown` com a classe `.prose` do plugin `@tailwindcss/typography`. Markdown suportado: `**bold**`, `*italic*`, `~~strikethrough~~`, `<u>underline</u>`.

---

## 4. Sistema de Cores

Todas as cores são definidas como **variáveis CSS em formato HSL** em `app/globals.css` e consumidas pelo Tailwind via `hsl(var(--token))`. Nunca use valores hex diretamente — use os tokens.

### Tokens de Design

| Token | Modo Escuro (HSL) | Uso |
|---|---|---|
| `--background` | `222 47% 4%` — slate-950 quase preto | Fundo de página |
| `--foreground` | `210 40% 98%` — branco levemente azulado | Texto principal |
| `--card` | `222 47% 7%` — slate-900 | Superfície de cartão |
| `--card-foreground` | `210 40% 98%` | Texto sobre cartão |
| `--popover` | `222 47% 4%` | Dropdowns, tooltips |
| `--popover-foreground` | `210 40% 98%` | Texto sobre popover |
| `--primary` | `25 95% 53%` — **orange-500** | CTAs, botões primários |
| `--primary-foreground` | `0 0% 100%` | Texto sobre laranja |
| `--secondary` | `222 47% 12%` — slate escuro | Botões secundários, chips |
| `--secondary-foreground` | `210 40% 98%` | Texto sobre secondary |
| `--muted` | `222 47% 15%` — slate intermediário | Fundos de campos, seções mortas |
| `--muted-foreground` | `215 20% 65%` — cinza-azulado | Placeholders, labels secundários |
| `--accent` | `25 95% 53%` — **orange-500** | Hover state, destaque |
| `--accent-foreground` | `0 0% 100%` | Texto sobre accent |
| `--destructive` | `0 62.8% 30.6%` — vermelho escuro | Erros, deleção |
| `--destructive-foreground` | `210 40% 98%` | Texto sobre destructive |
| `--border` | `222 47% 15%` | Bordas, divisores |
| `--input` | `222 47% 15%` | Borda de campos de input |
| `--ring` | `25 95% 53%` — **orange-500** | Focus ring |
| `--radius` | `0.5rem` | Raio base de bordas |

### Cor de Marca

**Laranja-500** (`hsl(25 95% 53%)` = `#F97316`) é a única cor de marca. Ela aparece em:
- Todos os elementos interativos primários (botões, links)
- Focus rings (`outline-ring`, `ring-ring`)
- Logo animado (borda giratória)
- Badges e indicadores de status ativo

---

## 5. Bordas e Raio

O sistema usa uma única variável `--radius: 0.5rem` como base, com derivações:

| Classe Tailwind | Valor calculado |
|---|---|
| `rounded-sm` | `calc(var(--radius) - 4px)` = 0.125rem |
| `rounded-md` | `calc(var(--radius) - 2px)` = 0.25rem |
| `rounded-lg` | `var(--radius)` = 0.5rem |
| `rounded-full` | Badges, avatar, botão-ícone circular |

---

## 6. Componentes UI (shadcn/ui)

Todos em `components/ui/`. Modificar diretamente o arquivo — não sobrescrever via className arbitrário sem entender o CVA.

### Button

Variantes via `class-variance-authority`:

| Variante | Aparência |
|---|---|
| `default` | Fundo laranja, texto branco |
| `destructive` | Fundo vermelho, texto claro |
| `outline` | Borda `border-input`, hover → fundo accent |
| `secondary` | Fundo `bg-secondary`, hover escurece |
| `ghost` | Sem fundo, hover → fundo accent |
| `link` | Texto laranja, underline no hover |

Tamanhos: `sm` (h-9), `default` (h-10), `lg` (h-11), `icon` (h-10 w-10).

### Card

Estrutura semântica: `Card > CardHeader > (CardTitle + CardDescription) + CardContent + CardFooter`.
- Fundo: `bg-card`, borda: `border`, sombra: `shadow-sm`, raio: `rounded-lg`
- Padding interno padrão: `p-6`

### Badge

`rounded-full`, `px-2.5 py-0.5`, `text-xs font-semibold`. Variantes: `default` (laranja), `secondary` (slate), `destructive` (vermelho), `outline` (transparente + borda).

### Input

`h-10`, `rounded-md`, `border border-input`, `bg-background`, `px-3 py-2`, `text-sm`. Focus: `ring-2 ring-ring ring-offset-2`.

### Select

Mesma linha visual do Input. Chevrons via lucide-react, check mark no item selecionado.

---

## 7. Ícones

Biblioteca exclusiva: **lucide-react**.

Padrão de tamanhos:
- `h-4 w-4` — inline em texto, botões pequenos
- `h-5 w-5` — ícones de navegação, ações padrão
- `h-[1.2rem] w-[1.2rem]` — theme toggle (garante alinhamento óptico)

Não misture outras bibliotecas de ícones.

---

## 8. Espaçamento e Layout

### Padding de área (definido no layout, não nas páginas)

| Área | Definido em | Valor |
|---|---|---|
| Admin (`/admin/*`) | `app/admin/layout.tsx` → `<main>` | `p-6 md:p-8` |
| Student (`/student/*`) | `app/student/layout.tsx` → `<main>` | `p-4 md:p-8` |

> **Regra:** páginas filhas **não devem** adicionar `container mx-auto p-6` ou qualquer padding/container próprio no wrapper raiz — isso duplica o espaço e empurra o título para baixo. O padding do `<main>` já posiciona o conteúdo. Use apenas `space-y-*` ou `max-w-*` quando necessário para limitar largura ou separar seções internas.

### Padrão de página admin

```tsx
// ✅ correto — título cola no padding do <main>
return (
  <div className="space-y-6">
    <h1>Título da Página</h1>
    ...
  </div>
)

// ❌ errado — duplica o espaçamento
return (
  <div className="container mx-auto p-6 space-y-6">
    <h1>Título da Página</h1>
    ...
  </div>
)
```

### Padrão de layout geral

Sidebar fixa à esquerda + Header horizontal + área de conteúdo com `flex-1 overflow-y-auto`. Em mobile: sidebar colapsada, navegação inferior.

---

## 9. Animações e Transições

| Elemento | Comportamento |
|---|---|
| Accordion | `accordion-down` / `accordion-up`, 0.2s ease-out, anima `height` |
| Sidebar | `transition-all duration-300` no colapso/expansão |
| Logo | Borda com `animate-spin [animation-duration:3s]` + `animate-pulse` no glow |
| Theme toggle | `transition-all` com `rotate` e `scale` nos ícones Sun/Moon |
| Hover de botão | `transition-colors` (padrão Tailwind) |
| Backdrop | `backdrop-blur-sm` em header e theme toggle |

Não use `transition: all` sem escopo — prefira `transition-colors`, `transition-transform`, `transition-opacity`.

---

## 10. Efeitos Visuais

- **Glassmorphism leve:** `bg-background/80 backdrop-blur-sm` no theme toggle e overlays
- **Sombras:** `shadow-sm` (cards), `shadow-lg` (elementos flutuantes como o toggle)
- **Opacidade em hover:** `hover:bg-primary/90`, `hover:bg-primary/80` — nunca altere a cor base, use opacidade
- **Border opacity:** `border-primary/20` para bordas sutis sem peso visual

---

## 11. Logo

O logo é o texto `"01"` com borda animada, construído inline em Tailwind.

```
Tamanhos:  sm = 8px (h-8 w-8)
           md = 14px (h-14 w-14) — padrão sidebar
           lg = 24px (h-24 w-24)

Estrutura: div externo → borda laranja + animate-spin (3s) + sombra pulse
           div interno → bg-black, texto branco bold, centralizado
```

---

## 12. Modo Escuro — Detalhes de Implementação

- Provider: `next-themes` com `attribute="class"` (injeta `.dark` no `<html>`)
- `defaultTheme="dark"`, `enableSystem={false}` — sistema operacional é **ignorado**
- `disableTransitionOnChange` — evita flash de cores na troca de tema
- Theme toggle está fixo `bottom-4 left-4` em todas as telas

**Para novos componentes:** sempre defina o estilo para `.dark` via Tailwind `dark:` prefix ou via variável CSS. Nunca assuma que o tema claro é o padrão de projeto — o dark mode é o produto.

---

## 13. Internacionalização Visual

- `lang="pt-BR"` no `<html>`
- Todos os labels, mensagens de erro, tooltips e estados vazios em português
- Datas no fuso de Araguaína (America/Araguaina) — relevante para componentes de calendário e exibição de timestamps

---

## 14. Checklist para Novos Componentes

- [ ] Usa `cn()` de `lib/utils.ts` para composição de classes
- [ ] Usa tokens CSS (`bg-card`, `text-muted-foreground`, etc.) — sem hex hardcoded
- [ ] Testado visualmente no dark mode
- [ ] Ícones exclusivamente de `lucide-react`
- [ ] Sem light-mode específico (`dark:` prefix apenas quando necessário como exceção)
- [ ] Tipografia usa escala existente — sem `text-[13px]` ou tamanhos arbitrários
- [ ] Animações via `transition-*` scoped, não `transition: all`
- [ ] Markdown em conteúdo textual renderizado com `.prose` do typography plugin
