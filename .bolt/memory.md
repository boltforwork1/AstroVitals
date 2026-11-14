# Project memory

## Product intent & audience

- App includes a gamification system (`GamificationContext` with `GamificationProvider` + `useGamification` hook) — suggests engagement/retention-oriented consumer or learner-facing product.

## Brand personality & voice

- Not yet inferred beyond production-quality, beautiful design guidance in `.bolt/prompt`.

## Visual design & UX direction

- Not yet inferred this turn; design specifics to be captured as screens are built.

## Decisions, constraints & rationale

- Stack: Vite + React, TypeScript (TSX), Tailwind CSS, Lucide React icons. No extra UI/theme/icon packages unless explicitly requested (per `.bolt/prompt`).
- Imports use `@/` path alias → `src/` (e.g., `@/context/GamificationContext`).
- React Context pattern: providers/hooks live in `src/context/`.
- Bug class to watch: duplicate `export` statements left at file bottoms after edits caused a build-breaking esbuild "Multiple exports with the same name" error. Verify single exports when editing context files.

## Open questions & assumptions

- Assumption: gamification state is client-side only; no backend/persistence confirmed yet.
- Open: exact scope/shape of gamification features (metrics, badges, achievements, persistence) still undefined.