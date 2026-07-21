# Page Content & Copy Parametrization — Design

## Context

The [content architecture spec](./2026-07-19-content-architecture-design.md)
moved every *collection* (books, timeline, projects, competencies, media) and
the site identity/indicators out of `src/content/*.ts` literals into
`content/*.yaml` and `content/*/*.md`. What's left hardcoded in `.tsx` files,
found by a full page-by-page audit:

1. Eight pages' `PageHeader` props (`kicker`/`title`/`lead`):
   `certificados`, `competencias`, `contato`, `contribuicao`, `galeria`,
   `producao-literaria`, `projetos`, `trajetoria` — plus `quem-sou`, which
   also has:
2. A 5-paragraph hardcoded biography in `quem-sou.tsx`, with inline
   `**bold**`/`*italic*` emphasis.
3. `contribuicao.tsx`'s 5 "pillars" (kicker numeral + title + text) — a
   content collection in all but location.
4. `dossie.tsx`'s "Currículo condensado" paragraph (one hardcoded prose
   block; the rest of that page is already composed from existing content).
5. `index.tsx`'s hero subtitle (found to be a byte-for-byte duplicate of
   `site.role` — a bug, not new content), section heading, and 3
   chapter-teaser cards.

Goal: bring all of the above under the same non-technical-editable content
model already established, reusing the existing loader pattern
(`parseYamlFile` / `parseMarkdownCollection` in `src/content/_lib/parse.ts`)
rather than inventing a new one.

## Non-goals (explicitly deferred)

- **Dossiê's 7 numbered section titles** (e.g. "1. Resumo da trajetória").
  These are fixed document structure, not content that changes independently
  of the page's code — left hardcoded.
- **UI microcopy / CTA labels** ("Gerar portfólio em PDF", "Abrir capítulo →",
  "Início" back-link, etc.) — chrome, not editorial content.
- **Markdown rendering for existing single-paragraph bodies**
  (`book.synopsis`, `project.context`, `competency.description`). These
  remain plain text rendered in a single `<p>`, exactly as today. The new
  `MarkdownContent` component (below) is used only for the new multi-
  paragraph bodies this spec introduces.

## Architecture

**`src/content/pageContent.ts`** (new loader, same shape as
`parseMarkdownCollection`-based loaders): reads `content/pages/*.md`,
validates against a schema where `kicker`/`title`/`lead` are optional
(only `dossie.md` omits them) and `body` is always a string. Exports:

```ts
export function getPageHeader(key: string): { kicker: string; title: string; lead: string }
```
Throws a descriptive build-time error naming the file if any of the three
fields is missing — the same fail-loud behavior as the existing schemas,
not a silent `undefined` render.

```ts
export function getPageBody(key: string): string
```
Returns `""` if the page has no body content.

**`src/content/contribuicao.ts`** (new loader): reads
`content/contribuicao/*.md`, same shape as `competencies.ts` (`kicker`,
`title`, body → `text`), sorted by filename.

**`content/site.yaml`** gains two fields consumed only by `index.tsx`:
`presentationHeading` (the "Uma escrita entre memória..." section heading)
and `homeChapters` (the 3 teaser cards: `to`/`kicker`/`title`/`desc`).
`index.tsx`'s hero subtitle changes from a hardcoded string to `{site.role}`
— removing an accidental duplicate, not adding a field.

**`src/components/MarkdownContent.tsx`** (new): a thin `react-markdown`
wrapper for the new long-form bodies (biography, dossiê resumo, contribuição
pillar text). Overrides only the `strong` element to keep the existing
`font-medium` styling; everything else (paragraphs, `em`) uses
`react-markdown`'s defaults, which is why plain sibling `<p>` output composes
correctly with the surrounding `space-y-6` containers already in place.
**New dependency: `react-markdown`** — renders to real React elements, no
`dangerouslySetInnerHTML`.

**Route changes** — each of the 9 header-bearing routes replaces its
hardcoded `<PageHeader kicker="..." title="..." lead="..." />` with props
from `getPageHeader("<key>")` (computed at module scope, alongside the
existing `site`/`indicators` imports). Additionally:
- `quem-sou.tsx`: renders `<MarkdownContent>{getPageBody("quem-sou")}</MarkdownContent>` after the existing `site.presentation` drop-cap paragraph.
- `dossie.tsx`: the "Currículo condensado" section body becomes `<MarkdownContent>{getPageBody("dossie")}</MarkdownContent>`.
- `contribuicao.tsx`: the hardcoded `pillars` array is deleted; the page maps over the new `pillars` export from `content/contribuicao.ts`, rendering each pillar's text via `MarkdownContent`.
- `index.tsx`: hero subtitle → `{site.role}`; new section heading → `{site.presentationHeading}`; the 3 chapter cards map over `homeChapters` instead of an inline array.

## Directory layout

```
content/
  pages/
    certificados.md
    competencias.md
    contato.md
    contribuicao.md
    galeria.md
    producao-literaria.md
    projetos.md
    quem-sou.md            (only file with a non-empty body: the biography)
    trajetoria.md
    dossie.md              (no kicker/title/lead — body only)
  contribuicao/
    01-preservacao-da-memoria.md
    02-fortalecimento-da-literatura.md
    03-valorizacao-das-mulheres.md
    04-identidade-regional.md
    05-democratizacao-da-cultura.md
  site.yaml                (extended, see below)
```

## Content schemas

**`content/pages/contato.md`** (representative simple case — header only):
```yaml
---
kicker: Correspondência
title: Contato
lead: Para propostas culturais, colaborações editoriais e convites institucionais.
---
```

**`content/pages/quem-sou.md`** (header + long-form body):
```yaml
---
kicker: Capítulo I · Biografia
title: Quem sou
lead: Uma vida entre livros, palavras e o rio que atravessa três países.
---
Nasci em **Foz do Iguaçu**, cidade de fronteira onde as línguas se cruzam...

Formei-me em **Letras Português/Espanhol pela UNIOESTE** e, mais tarde...

Ao longo dos últimos anos, tenho articulado três frentes: *escrita autoral*
— em poesia, crônica e ensaio —, *pesquisa da memória local* em torno das
mulheres da fronteira, e *produção cultural*, através da concepção...

Minha atuação parte do entendimento de que a literatura é patrimônio...

Este portfólio reúne parte desse percurso...
```
(blank lines between paragraphs — `react-markdown` renders each as its own `<p>`)

**`content/pages/dossie.md`** (body only, no header):
```yaml
---
---
Formada em Letras Português/Espanhol pela UNIOESTE, com mestrado em Letras.
Atua há mais de uma década na articulação entre escrita autoral, pesquisa
da memória local e produção cultural...
```

**`content/contribuicao/01-preservacao-da-memoria.md`**:
```yaml
---
kicker: "I"
title: Preservação da memória
---
Cada projeto é também um arquivo: registrar histórias de vida, cadernos,
fotografias e cartas é impedir que a cidade esqueça de si mesma.
```

**`content/site.yaml` additions**:
```yaml
presentationHeading: Uma escrita entre memória, literatura e fronteira.
homeChapters:
  - to: /trajetoria
    kicker: Capítulo I
    title: Trajetória cultural
    desc: Uma linha do tempo comentada: formação, projetos, publicações e participações.
  - to: /producao-literaria
    kicker: Capítulo II
    title: Produção literária
    desc: A estante da autora — livros, antologias, crônicas, poesia e artigos.
  - to: /projetos
    kicker: Capítulo III
    title: Projetos culturais
    desc: Iniciativas realizadas, com contexto, atividades, resultados e documentos.
```

## Migration

Data to transcribe (verbatim from current `.tsx` hardcoding, no wording
changes): 9 page-header files, the 5-paragraph biography body, the dossiê
resumo paragraph, 5 contribuição pillar files, and the 2 new `site.yaml`
fields. After migration, the corresponding hardcoded JSX/arrays are deleted
from `index.tsx`, `quem-sou.tsx`, `dossie.tsx`, and `contribuicao.tsx` —
each route file should end up shorter, not longer, since header props and
prose move to content files and only rendering logic remains.
