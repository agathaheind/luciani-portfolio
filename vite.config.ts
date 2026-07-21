// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Static GitHub Pages export: prerender every route to a real HTML file
    // using TanStack Start's own vite-preview-based prerenderer. Nitro's
    // "github-pages"/"static" presets can't be used here — their built-in
    // prerender step spins up a fresh Nitro instance from a config snapshot
    // that predates the SSR renderer wiring, so every route 404s.
    ...(isGithubPagesBuild
      ? {
          prerender: { enabled: true, crawlLinks: true },
          // GitHub Pages has no server-side router, so unknown deep-linked
          // paths need a static 404.html that boots the client-side router,
          // which then renders the real route (or its not-found UI).
          spa: { prerender: { outputPath: "/404.html" } },
        }
      : {}),
  },
  vite: {
    base: isGithubPagesBuild ? "/luciani-portfolio/" : "/",
  },
  nitro: isGithubPagesBuild ? false : undefined,
});
