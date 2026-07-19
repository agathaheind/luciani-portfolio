# Luciani Portfolio Rebuild — Design

## Context

`lovable/` (this repo) is a Lovable.dev-generated portfolio site for Igor's real
client, a writer/cultural producer. It was built under a placeholder identity
("Luciani Heindrickson", Foz do Iguaçu) that turned out to match the real
client closely but not exactly: her full name is **Luciani Heindrickson da
Silva**, and her city is **Santa Terezinha de Itaipu, Paraná**, not Foz do
Iguaçu.

Goals for this rebuild, in order:

1. **Eject from Lovable** — own the codebase independently; no ties to
   Lovable's editor/git sync.
2. **Portfolio case study** — end up with a project Igor can show in his own
   dev portfolio as something he built.
3. **Fix the identity data** — correct name and city.

Deeper content accuracy (books, timeline events, projects, certificates,
remaining regional references, placeholder phone number) is **explicitly
deferred** to a review pass after this rebuild — not part of this spec.

## Source and destination

- Source: `/home/inasc/projects/lovable` (read-only reference; not modified)
- Destination: `/home/inasc/projects/luciani-portfolio` (new, independent repo)

## Approach

Copy the existing repo as the base (not a from-scratch rebuild) — the code
already works and matches the desired design. Strip Lovable-specific ties,
then correct the two identity fields.

### 1. Copy

Copy all tracked project files from `lovable/` into the new directory,
excluding:

- `.git/`
- `node_modules/`
- `*:Zone.Identifier` files (WSL/Windows metadata artifacts, unrelated to
  Lovable but junk regardless)

### 2. Strip Lovable ties

Remove/edit the following. These are cosmetic and telemetry hooks scoped to
Lovable's hosted editor — none of them are required for the app to build or
run standalone:

- Delete `.lovable/` (editor project metadata)
- Remove the `<!-- LOVABLE:BEGIN --> ... <!-- LOVABLE:END -->` banner from
  `AGENTS.md`
- Delete `src/lib/lovable-error-reporting.ts` and its call site in
  `src/routes/__root.tsx` (`reportLovableError` in `ErrorComponent`) — it only
  forwards to `window.__lovableEvents`, which is undefined outside the
  Lovable editor iframe, so this is a no-op removal, not a behavior change
- Trim the `minimumReleaseAgeExcludes` list in `bunfig.toml` down to just what
  the surviving dependencies need (drop entries for packages no longer used,
  e.g. `@lovable.dev/mcp-js`, `@lovable.dev/vite-plugin-dev-server-bridge`,
  `@lovable.dev/vite-plugin-hmr-gate`, `@lovable.dev/email-js`,
  `@lovable.dev/webhooks-js` if unused)
- `package.json`: rename `"name"` from `tanstack_start_ts` to
  `luciani-portfolio`

**Explicit non-goal for this pass:** `vite.config.ts` keeps depending on
`@lovable.dev/vite-tanstack-config`. That package wires up TanStack Start,
Tailwind, path aliases, the nitro build target, and dev-sandbox detection in
one call. It's a build-time config helper, not a runtime call-home — keeping
it doesn't reintroduce any editor/git coupling. Hand-rolling an equivalent
config is real, riskier work (wrong plugin order or nitro preset breaks the
build) and isn't required to satisfy "own the codebase independently." Noted
as a candidate follow-up if the user later wants zero `@lovable.dev/*`
dependencies at all.

### 3. Fix identity data

In `src/content/site.ts`:

- `author`: `"Luciani Heindrickson"` → `"Luciani Heindrickson da Silva"`
- `city`: `"Foz do Iguaçu, Paraná — Brasil"` → `"Santa Terezinha de Itaipu, Paraná — Brasil"`

In `src/routes/__root.tsx` head metadata (title/description/author/og tags),
propagate the same name change so page `<title>` and social meta stay
consistent with `site.ts`.

Everything else — timeline `city` fields still saying "Foz do Iguaçu, PR",
the `Cadernos de Memória I` book synopsis mentioning Foz do Iguaçu, the
placeholder phone number, and all other content — is left as-is. It's
flagged for the follow-up content-accuracy review, not touched here.

### 4. Git

`git init` a fresh history in the new directory. No commit is made as part of
this work — commits are left to the user, per standing preference.

### 5. Verify

From the new directory:

- `bun install`
- `bun run build` — must succeed
- `bun run lint` — must succeed
- `bun run dev` — boot the dev server and confirm the home page renders
  (smoke test, not a full click-through)

## Out of scope (deferred to the post-rebuild review pass)

- Accuracy of books, timeline events, projects, certificates, and media
  entries
- Remaining "Foz do Iguaçu" references outside `site.ts`/`__root.tsx`
- Real phone number (currently a placeholder)
- Fully removing `@lovable.dev/vite-tanstack-config`
