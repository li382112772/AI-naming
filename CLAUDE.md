# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI 智能起名顾问 (AI Intelligent Naming Advisor) — a React SPA that combines traditional Chinese Bazi/Wuxing analysis with AI to generate personalized baby name recommendations. Currently in MVP stage with mock AI responses; designed for future integration with real AI APIs.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — TypeScript check + Vite production build (`tsc -b && vite build`)
- `npm run check` — TypeScript type checking only (`tsc -b --noEmit`)
- `npm run lint` — ESLint
- `npm run test` — Vitest (run once with `npx vitest run`, single file with `npx vitest run src/path/to/file.test.ts`)
- `npm run preview` — Preview production build locally

## Architecture

**Stack**: React 19 + TypeScript 5.7 + Vite 6 + Tailwind CSS 4 + Zustand 5

**Path alias**: `@/*` maps to `./src/*`

**Key layers**:

- **Pages** (`src/pages/`): Route-level components. `ChatPage.tsx` is the main flow orchestrator — it syncs session state with the naming flow steps.
- **Hooks** (`src/hooks/`): All state management lives here via Zustand stores and custom hooks. `useNamingFlow` drives the multi-step conversation flow; `useAI` handles AI generation (currently mock); `useSessions`, `useFavorites`, `usePayment` manage their respective domains.
- **Services** (`src/services/`): Data persistence layer using localforage (IndexedDB). `db.ts` defines three stores: sessions, favorites, orders.
- **Components** (`src/components/`): Domain-grouped (`bazi/`, `naming/`, `chat/`, `payment/`) plus shared `ui/` (Shadcn/ui, new-york style, zinc base color).
- **Lib** (`src/lib/`): AI prompt templates (`prompts.ts`), Zod response schemas (`schemas.ts`), utility functions (`utils.ts`).
- **Types** (`src/types/index.ts`): Core domain types — `BabyInfo`, `BabySession`, `BaziAnalysis`, `NameDetail`, `CharacterInfo`.

**Naming flow steps** (defined in `useNamingFlow`): welcome → input → analyzing → analysis-result → style-selection → generating-names → name-list

**Unlock/payment model**: First name per style is a free preview; remaining names require payment which unlocks by series. Session tracks `unlockedSeries[]`.

## Code Style

- Prettier: no semicolons, single quotes, 2-space indent, ES5 trailing commas
- UI components use Radix UI primitives + Tailwind + `cn()` utility from `src/lib/utils.ts`
- Animations via Framer Motion

## Documentation

Detailed specs live in `docs/` (PRD, technical design, database schema, UI/UX, payment API, API specs, deployment).
