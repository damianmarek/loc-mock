# AGENTS.md

## Runtime
- Use **Bun** (not Node.js/npm/pnpm). `bun install`, `bun run <script>`, `bun test`.

## Commands
- `bun install` — install dependencies
- `bun run dev` — cold start (vite build + electrobun dev, no HMR)
- `bun run dev:hmr` — dev with HMR (concurrently vite + electrobun dev)
- `bun run build:web` — build React frontend only (vite build → dist/)
- `bun run build` — full production build (vite build + electrobun build)
- `bun run start` — vite build + electrobun dev (rebuilds web assets first)

## Architecture
- **Electrobun** two-process desktop app (macOS only):
  - **`src/bun/index.ts`** — main process: app menu, window creation, RPC handlers. Shells to `xcrun simctl location booted`.
  - **`src/mainview/`** — webview UI: React 18 + shadcn/ui. MapLibre GL map with Nominatim geocoding. Communicates via Electrobun RPC.
  - **`src/shared/types.ts`** — `LocMockRPCSchema` is the RPC contract; changes must stay in sync between both processes.
- Build pipeline: Vite builds React app to `dist/`, Electrobun copies `dist/` into app bundle.
- **Dev HMR**: Main process detects Vite dev server on `:5173`. Uses `concurrently` to run Vite + Electrobun.
- **Prod**: `views://mainview/index.html` loads built assets with relative paths.

## Platform
- **macOS arm64 only.** Requires Xcode CLI tools (`xcrun simctl`).
- App sets/clears location on a **booted** iOS simulator. No other platform support.

## Conventions
- TypeScript strict mode: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`.
- `verbatimModuleSyntax: true` — use `import type` for type-only imports; plain value imports for types will fail.
- `noUnusedLocals` / `noUnusedParameters` are **false** — won't get compiler errors for unused code.
- Shell commands use `Bun.$` template literals (not `child_process`/`execa`).
- RPC: `BrowserView.defineRPC<T>()` on bun side, `Electroview.defineRPC<T>()` on webview side (same type param).
- UI uses Tailwind CSS v3 + shadcn/ui components (zinc base, default style).
- Map: MapLibre GL (via react-map-gl/maplibre) with OSM raster tiles.
- Toast notifications: Sonner (`toast.success()` / `toast.error()`).
- Path aliases: `@/` → `src/mainview/`, `@shared/` → `src/shared/`.
