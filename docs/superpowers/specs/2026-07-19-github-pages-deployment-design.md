# GitHub Pages Deployment — Design

## Context

`luciani-portfolio` needs to be published to GitHub Pages at the default URL
`https://agathaheind.github.io/luciani-portfolio/` (no custom domain). This
also answers the open question from the content-architecture spec: content
edits go live via a normal git push/merge to `main`, which triggers a GitHub
Actions build and redeploy — no separate manual deploy step once this is set
up.

The app currently builds via Nitro in SSR mode (server-rendered, needs a
Node-capable host). GitHub Pages only serves static files, so this is a
build-target change, not just a hosting change.

This spec is independent of the content-architecture spec — it can be
implemented before, after, or interleaved with it — but the sitemap fix
below is more useful once `content/pages.yaml` exists, so sequencing that
spec first is preferable, not required.

## Findings from inspecting the actual installed packages

(Not guessed — confirmed by reading `node_modules/@lovable.dev/vite-tanstack-config`'s
type definitions and `node_modules/nitro/dist/_presets.mjs` directly.)

- `@lovable.dev/vite-tanstack-config`'s `defineConfig()` accepts a `nitro`
  option: `{ preset?: string, output?: {...}, cloudflare?: {...} }`,
  force-enabling Nitro with the given overrides. This is the documented
  override surface — not a workaround.
- Nitro ships a built-in `github-pages` preset. Its definition: extends
  `static` (`prerender.crawlLinks: true`, output to `.output/public`), adds
  `prerender.routes: ["/", "/404.html"]` as seed routes, and a `compiled`
  hook that writes `.output/public/.nojekyll` automatically (required so
  GitHub Pages doesn't run Jekyll over the `_`-prefixed asset folders Vite
  generates).
- `crawlLinks: true` means Nitro prerenders `/`, discovers every link in the
  rendered HTML (including each `/projetos/$slug` card linked from the
  `/projetos` list page), and recursively prerenders those too — dynamic
  routes do not need to be manually enumerated.
- A route that only exports `server.handlers` (like `sitemap[.]xml.ts`) has
  no HTML page linking to it, so link-crawling won't discover it — it must
  be added explicitly to `prerender.routes`.

## Configuration changes

**`vite.config.ts`:**
- `nitro: { preset: "github-pages" }`
- `nitro.prerender.routes` extended to include `/sitemap.xml` (in addition
  to the preset's default `/` and `/404.html`)
- Vite `base: "/luciani-portfolio/"` passed through the `vite` option

**`src/router.tsx`:**
- `createRouter({ ..., basepath: "/luciani-portfolio/" })` so client-side
  navigation resolves correctly once the app is served from the GitHub
  Pages subpath instead of the root. (Whether this needs to be conditional
  on environment, e.g. empty for local dev vs. set for the GH Pages build,
  or whether TanStack Start derives it from Vite's `base` automatically, is
  confirmed during implementation by testing both a local `bun run dev` and
  a local static preview of the GH Pages build — not guessed here.)

**`src/routes/sitemap[.]xml.ts`:**
- `BASE_URL` changes from `""` to `"https://agathaheind.github.io/luciani-portfolio"`
  so the generated XML contains real absolute URLs instead of bare paths.
- The hardcoded `staticPaths` array is replaced with the enabled-page list
  derived from `content/pages.yaml` (from the content-architecture spec) —
  if that spec hasn't landed yet when this one is implemented, the hardcoded
  list stays as a placeholder and this specific change is deferred, without
  blocking the rest of this spec.

## GitHub Actions workflow

New `.github/workflows/deploy.yml`:
- Trigger: push to `main`
- Steps: checkout → set up bun → `bun install` → `bun run build` →
  `actions/configure-pages` → `actions/upload-pages-artifact` (path:
  `.output/public`) → `actions/deploy-pages`
- Uses the official Pages deployment action trio (not the legacy
  `gh-pages`-branch push the Nitro preset's `commands.deploy` hint suggests)
  so it integrates with the repo's Settings → Pages → "Deploy from GitHub
  Actions" source directly, no extra branch needed.

## Branch and remote reconciliation

The repo already has `origin` set to `https://github.com/agathaheind/luciani-portfolio.git`,
with a remote `main` branch containing a single placeholder "Initial commit"
(just a README, different author) — unrelated to this project's actual
history, which lives on local `master`.

Plan:
1. Rename local `master` → `main`
2. Push to `origin`, replacing the placeholder commit on the remote `main`

**Both steps are prepared and their exact commands confirmed with the user
before execution** — this rewrites a branch on a real, shared GitHub repo,
which is a hard-to-reverse, external-visibility action per this project's
standing safety rules. This is not a step the implementer subagent runs
unattended.

## Manual step (outside this codebase)

In the GitHub repo's Settings → Pages, the source must be set to "GitHub
Actions" (one-time setup; not something a git push can do). This is called
out at the end of implementation as a step for the user to do themselves, or
attempted via `gh api` if the user prefers and is authenticated — either
way, confirmed with the user first, not done silently.

## Out of scope

- Custom domain / DNS configuration (default GitHub Pages URL was chosen)
- Any change to the SSR architecture beyond what's needed for static export
  (the app keeps its TanStack Start route/loader structure; only the Nitro
  output target changes)
