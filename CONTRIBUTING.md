# Contributing to Prifeed

Thanks for your interest in Prifeed. This guide explains how to set up the project, the code style we follow, and the workflow for issues and pull requests.

## Quick start

You need Node.js (LTS), pnpm, and Git. On Windows you also need a build chain for native modules.

```sh
git clone https://github.com/<owner>/prifeed
cd prifeed
pnpm install
pnpm dev
```

The dev server starts the Electron app with HMR for the renderer. Edits to `src/main/**` and `src/preload/**` need a full restart (Ctrl+C then `pnpm dev` again).

## Project layout

```
src/
  main/      Electron main process (Node, filesystem, SQLite)
  preload/   IPC bridge (typed `window.api` exposed to renderer)
  renderer/  React UI (Vite, TypeScript)
```

Renderer code uses the `@renderer/*` import alias. Do not use relative paths like `../../components/Foo`.

## Code style

We use ESLint and Prettier. Run them before you commit:

```sh
pnpm lint
pnpm format
pnpm typecheck
```

A few project rules:

- **English only** in code, UI strings, comments, commit messages, and docs.
- **Plain language** for public-facing text. Short sentences. No idioms.
- **Keep technical terms as they are.** Do not simplify words like `IPC`, `WAL`, `cascade`, or library names.
- **No em-dashes** (`—`) in any text. Use commas, colons, parentheses, or short sentences.
- **Default to no comments.** Add a comment only when it explains a non-obvious "why". Public APIs in `lib/` and `db.ts` get JSDoc.

## Branch and commit workflow

We use trunk-based development. The `main` branch is always releasable.

1. Create a branch from `main` for each change.
   - `feat/photo-attachments`, `fix/comment-edit-loses-newlines`, `docs/readme-screenshots`
2. Make small commits with a clear message.
3. Open a pull request from your branch to `main`.
4. The PR is squash-merged after review.

### Commit message format

We follow [Conventional Commits](https://www.conventionalcommits.org/). The header is short:

```
<type>: <short summary>
```

Common types:

- `feat`: a new user-facing feature
- `fix`: a bug fix
- `refactor`: a code change that does not add a feature or fix a bug
- `docs`: a docs-only change
- `chore`: build, tooling, or housekeeping
- `test`: adding or fixing tests
- `style`: formatting, whitespace, no logic change

Examples:

```
feat: add photo attachments to posts
fix: comment edit drops trailing newline
refactor: extract KebabMenu component
docs: add SECURITY.md
```

For a body, leave a blank line after the header and write a few short sentences. Wrap at 72 characters.

## Pull requests

For a small fix, open a PR directly. For a larger change, please open an issue first so we can agree on the direction. This saves you from writing code that does not match the project plan.

Before you open the PR:

- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm format` was run
- The PR description explains what changed and why

PRs are squash-merged. The squash commit uses the PR title as its message, so write the title as a Conventional Commit (for example, `feat: photo attachments`).

## Reporting bugs and feature requests

Use [GitHub Issues](https://github.com/<owner>/prifeed/issues). Please search for an existing issue first.

A good bug report has:

- A short title
- Steps to reproduce
- What you expected
- What actually happened
- App version, OS, and any error message

A good feature request has:

- The problem you are solving
- The use case
- Any alternative you tried

For security issues, please follow [SECURITY.md](SECURITY.md) and do **not** open a public issue.

## License of contributions

By sending a pull request, you agree that your contribution is licensed under the same license as the project (AGPL-3.0). You also confirm that you have the right to submit the code.

## Questions

For everything that is not a bug or a feature request, open a [Discussion](https://github.com/<owner>/prifeed/discussions) (when enabled) or a regular issue.
