# Content Architecture & Page Visibility — Design

## Context

`luciani-portfolio` currently stores all editable content — bio, books, timeline,
projects, competencies, photos, certificates — as hand-authored TypeScript
literals in `src/content/*.ts`. The client, Luciani, is not a developer. She
needs to be able to edit her own bio, add a new book or timeline entry, and
show/hide sections of the site herself, without touching TypeScript syntax or
understanding the build.

Goals:

1. Move all editable content out of `.ts` files into plain Markdown (with
   YAML frontmatter) and YAML files she can open and edit directly (via
   GitHub's web editor or a local text editor).
2. Let her show/hide any of the site's secondary pages via a single config
   file, without touching route code.
3. Do all of this without changing the public API of `src/content/*.ts` —
   routes and components keep importing exactly what they import today, so
   this stays a content-layer change, not a rewrite.

## Non-goals (explicitly deferred)

- **A generic new-page-type builder.** She may want a structurally new page
  someday (a blog, an FAQ), but doesn't need one now. This design doesn't
  preclude adding one later (content lives outside `src/`, page visibility
  is already config-driven), but it isn't built now.
- **Explicit `project:` reference field on photos/documents.** The existing
  `photoPrefix`/`documentPrefix` filename-prefix matching between a project
  and its media already works and requires no route changes to preserve — it
  is relocated, not replaced.
- **Instant/live content updates.** Content is read via `import.meta.glob` at
  build time, same as today's TS literals. A content edit requires a rebuild
  to go live — see the GitHub Pages deployment spec for how that rebuild is
  triggered.

## Architecture

A new top-level `content/` directory (sibling to `src/`, not nested inside
it) holds every editable file. Each existing `src/content/*.ts` module is
rewritten as a thin **loader**: it uses `import.meta.glob` to read the raw
text of its matching files under `content/`, parses them (`gray-matter` for
Markdown+frontmatter, `js-yaml` for pure-YAML files), validates the parsed
data against a `zod` schema (already a project dependency), and exports the
same names and shapes the codebase already imports:

- `src/content/site.ts` → exports `site`, `indicators` (from `content/site.yaml`)
- `src/content/competencies.ts` → exports `competencies` (from `content/competencies/*.md`)
- `src/content/books.ts` → exports `books`, `bookCategoryLabel` (from `content/books/*.md`)
- `src/content/timeline.ts` → exports `timeline` (from `content/timeline/*.md`)
- `src/content/projects.ts` → exports `projects`, `projectsBySlug` (from `content/projects/*.md`)
- `src/content/media.ts` → exports `photos`, `documents`, `photosByCategory`,
  `photosByPrefix`, `documentsByPrefix` (from `content/media/photos/*.md` and
  `content/media/documents/*.md`)

**Validation failure behavior:** if a file is missing a required field or has
a value that doesn't match its type (e.g. `status` isn't one of the allowed
values), the build fails with an error naming the exact file and field —
never a silent bad render or a cryptic downstream type error.

Two new dependencies: `gray-matter` (frontmatter parsing) and `js-yaml` (pure
YAML parsing for the two config files; also a transitive dependency of
`gray-matter`, but used directly here) plus `@types/js-yaml`.

## Directory layout

```
content/
  site.yaml
  pages.yaml
  competencies/
    01-pesquisa-cultural.md
    02-historia-oral.md
    ...                          (numeric filename prefix controls display order)
  books/
    vozes-de-fronteira.md
    fio-dagua.md
    ...                          (sorted by `year` field, descending)
  timeline/
    2025-antologia-psique.md
    2024-mentoria-escrita.md
    ...                          (sorted by `year` field, descending)
  projects/
    mulheres-que-escrevem.md
    feira-do-livro.md
    ...                          (filename IS the slug used at /projetos/$slug)
  media/
    photos/
      clube-leitura.md
      ensaio-teatro-unila.md
    documents/
      certificado-antologia-psique.md
      certificado-mencao-honrosa.md
      ...

public/
  media/
    photos/       (actual .jpg files, dropped in directly, referenced by path)
    documents/    (actual .pdf files, when available)
```

## Content schemas

**`content/site.yaml`** (replaces `site.ts`'s `site` and `indicators`):
```yaml
author: Luciani Heindrickson da Silva
role: Escritora · Pesquisadora da memória local · Produtora Cultural
city: Santa Terezinha de Itaipu, Paraná — Brasil
email: contato@lucianiheindrickson.com.br
phone: "+55 (45) 90000-0000"
instagram: "@lucianiheindrickson"
tagline: >
  Escrita, memória e produção cultural na fronteira. Um portfólio
  institucional para editais públicos de fomento à cultura.
presentation: >
  Luciani Heindrickson da Silva é brasileira, natural de Foz do Iguaçu (PR)...
indicators:
  - label: Participações em eventos
    value: "24+"
  - label: Produções literárias
    value: "07"
  - label: Projetos culturais
    value: "12"
  - label: Publicações & antologias
    value: "15"
```

**`content/competencies/*.md`** (frontmatter `title`; body = `description`):
```yaml
title: Pesquisa Cultural
---
Investigação de acervos, memória social e patrimônio, articulando fontes
documentais e trabalho de campo.
```

**`content/books/*.md`** (frontmatter `category`, `year`, `status`; body = `synopsis`):
```yaml
category: livro          # livro | coletanea | cronica | poesia | artigo | revista | capitulo
year: "2024"
status: "No prelo"        # Publicado | No prelo | Em produção
title: Vozes de Fronteira
---
Ensaio literário sobre memória, língua e mulheres da tríplice fronteira...
```
(`bookCategoryLabel` display-name mapping for the `category` enum stays a
small hardcoded record in the loader — it's a fixed vocabulary, not editable
content.)

**`content/timeline/*.md`** (frontmatter `year`, `title`, `institution?`,
`city?`, `image?`, `certificate?`; body = `description`):
```yaml
year: "2025"
title: E-Antologia Poética PSIQUÊ
institution: Editora Fênixart
city: Brasil
certificate: Certificado de Participação — PSIQUÊ
---
Participação como poeta convidada na antologia PSIQUÊ...
```

**`content/projects/*.md`** (frontmatter `title`, `subtitle?`, `year`,
`summary`, `objectives`, `activities`, `results` as YAML lists,
`photoPrefix`, `documentPrefix`; the Markdown body is the longer `context`
paragraph — `summary` stays a short frontmatter string since it's used as a
one-line teaser/meta-description elsewhere, while `context` is free-form
prose better suited to a Markdown body):
```yaml
title: Mulheres que Escrevem
subtitle: Escrita, escuta e memória feminina
year: "2024"
summary: >
  Ciclo de oficinas de escrita criativa voltado a mulheres da tríplice
  fronteira, com foco em narrativas de vida, memória e território.
objectives:
  - Oferecer formação em escrita criativa e revisão de textos autorais
  - Reunir e organizar narrativas femininas do território
activities:
  - 8 oficinas presenciais de escrita criativa
results:
  - 32 mulheres participantes ao longo do ciclo
photoPrefix: Projeto_Mulheres_
documentPrefix: Certificado_Projeto_Mulheres_
---
O projeto nasce da constatação de que muitas mulheres da região mantêm
memórias, cadernos e cartas sem espaço institucional de circulação...
```

**`content/media/photos/*.md`** (frontmatter `file`, `category`, `caption?`;
no body — captions are one short line, kept as a frontmatter field for
consistency with the other pure-metadata collection below): `file` matches
the current filename-prefix convention against a project's `photoPrefix`.
`url` is no longer imported — it's derived from a `public/media/photos/<file>`
path.

**`content/media/documents/*.md`** (frontmatter `file`, `title`,
`institution`, `year`, `url?`): same prefix convention via `documentPrefix`;
`url` defaults to `"#"` (not yet uploaded) or a real `/media/documents/...`
path once the PDF exists.

## Page visibility

**`content/pages.yaml`** becomes the single source of truth for the nav menu,
replacing the hardcoded `nav` array in `src/components/SiteLayout.tsx`:
```yaml
- key: quem-sou
  to: /quem-sou
  label: Quem Sou
  enabled: true
  order: 1
- key: contribuicao
  to: /contribuicao
  label: Contribuição
  enabled: false
  order: 8
```
Home (`/`) is not in this list — always enabled, always first.

This same config drives three things:
1. **Nav rendering** in `SiteLayout.tsx` (desktop, mobile, footer) — filtered
   to `enabled: true`, sorted by `order`.
2. **Route guards** — each of the 9 toggleable routes gets a one-line
   `beforeLoad` calling a shared `assertPageEnabled("quem-sou")` helper that
   throws `notFound()` if the page is disabled, so directly visiting a
   hidden page's URL doesn't render it.
3. **Sitemap generation** (`src/routes/sitemap[.]xml.ts`) — disabled pages
   are excluded automatically instead of the current hardcoded path list.

## Migration

Every current hard-coded value in `src/content/*.ts` (already corrected in
the prior rebuild: real name, real city) is transcribed into the new files
as part of implementation — this is a one-time data migration, not a design
concern, but it's real work: 6 books, 8 timeline entries, 4 projects, 10
competencies, 2 photos, 7 documents, plus the site/indicators/pages configs.
After migration, the old literal arrays are deleted from each `src/content/*.ts`
file, leaving only the loader logic.
