---
name: prifeed-conventions
description: Code style and structural conventions for Prifeed. Use when adding a component, writing a library, naming a file, or starting a branch. Covers TypeScript style, alias imports, JSDoc, file layout, and Conventional Commits.
---

# Prifeed conventions

## Language

- All code, UI strings, comments, and commit messages are in English.
- Technical terms stay as they are. Do not translate library or API names.

## Imports

- Renderer code uses the `@renderer/*` alias, not relative paths.
  - Good: `import { foo } from '@renderer/lib/foo'`
  - Bad: `import { foo } from '../../lib/foo'`

## File layout

- `src/main/` Electron main process (Node, filesystem, SQLite).
- `src/preload/` IPC bridge that exposes `window.api` to the renderer.
- `src/renderer/src/lib/` utilities and hooks (no JSX).
- `src/renderer/src/components/` React components.
- `src/renderer/src/types.ts` shared types.

## Components

- One component per file. Filename matches the exported component (`PostCard.tsx`). If multiple small components are tightly coupled, consider grouping them in a single file with clear documentation.
- Use Headless UI for interactive primitives (`Menu`, `Dialog`, `Textarea`).
- Use Heroicons for icons. Import from `@heroicons/react/16/solid` for inline UI icons.
- Style with Tailwind v4 utilities and the theme variables (`bg-bg`, `text-text`, `border-border`, `bg-accent`, etc.). Do not hardcode hex colors in components.

## JSDoc

- Add JSDoc to every exported function or hook in `src/renderer/src/lib/` and `src/main/db.ts`.
- Include an `@example` for hooks and non-trivial helpers.
- Skip JSDoc on internal helpers and component prop interfaces unless a prop is non-obvious.

## Database

- The DB module is `src/main/db.ts`. The schema is migrated with the `user_version` PRAGMA.
- For a schema change, append a new `if (version < N)` block to `migrate()` and bump the pragma at the end of the block. Do not edit a past block.

## Branches and commits

- Branch from `main` for every change. Never commit to `main` directly.
- Branch prefix: `feat/`, `fix/`, `refactor/`, `docs/`, `chore/`, `test/`, `style/`.
- Commits follow Conventional Commits: `<type>: <short summary>`. Header is 50 to 72 characters.
- One logical change per branch and PR.
- Pull requests are squash-merged. The PR title is the squash commit message, so write the title as a Conventional Commit.
- If a convention cannot be followed due to technical constraints, document the reason in the code or PR description.

## Verification

Before opening a PR:

- `pnpm typecheck` passes
- `pnpm lint` passes
- `pnpm format` was run
