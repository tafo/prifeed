<div align="center">
  <img src="resources/icons/icon-d-t-letter.svg" width="96" height="96" alt="Prifeed" />

  <h1>Prifeed</h1>

  <p><strong>A local-first, private journal feed — your thoughts, your machine, your timeline.</strong></p>
</div>

---

Prifeed is a desktop app for keeping a personal, chronological journal that feels like a social timeline — but lives entirely on your computer. Write short notes or long reflections, comment on past entries, attach photos (soon), and revisit your timeline whenever you want. No accounts, no servers, no telemetry. The data is a SQLite file and a media folder you can copy, back up, or walk away with.

It started from a simple frustration: people use private social accounts as a notebook because the timeline format works — but one accidental click and your private thoughts are public. Prifeed gives you that timeline format without the leak risk.

## Privacy commitment

- **No accounts.** There is no sign-up, no email, no login.
- **No servers.** All your data lives on your device, in a file you own.
- **No telemetry, no analytics.** The app does not phone home.
- **No vendor lock-in.** Your entries are stored as plain SQLite + media files. Export means *copy the folder*.
- **Open source.** Read the code. Build it yourself. Audit any claim on this list.

When optional sync ships, it will be **bring-your-own-cloud** — Prifeed talks to your Google Drive, Dropbox, or self-hosted storage. We never see your data.

## Screenshots

> _Screenshots coming soon._

## Features

- 📜 **Timeline feed** — entries grouped by day (Today, Yesterday, weekday, date)
- 💬 **Threaded comments** — leave comments on your own past entries; revise the way you remember
- ✏️ **Edit and delete** — with a clean in-app confirmation, no native browser popups
- 🌗 **Light, dark, and system themes** — Atom One Dark and GitHub Light inspired
- ⌨️ **Keyboard-friendly** — `⌘N` (or `Ctrl+N`) to write a new entry, `⌘+Enter` to post, `Esc` to cancel
- 🪶 **Premium minimalist UI** — Phoenix-inspired typography and layout, slim theme-aware scrollbars, auto-grow text fields
- 🔒 **Local-first storage** — better-sqlite3 file in your OS user-data folder

## Tech stack

- **[Electron 39](https://www.electronjs.org/)** — cross-platform desktop runtime
- **[React 19](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/)** — UI
- **[Vite 7](https://vitejs.dev/)** via **[electron-vite](https://electron-vite.org/)** — bundler
- **[Tailwind CSS v4](https://tailwindcss.com/)** — styling
- **[Headless UI v2](https://headlessui.com/)** + **[Heroicons](https://heroicons.com/)** — accessible primitives
- **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** — local data storage
- **[pnpm](https://pnpm.io/)** — package manager

## Getting started

### Prerequisites

- Node.js (LTS recommended)
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)
- On Windows: a working build chain for native modules (see [pnpm docs](https://pnpm.io/) and `package.json` `pnpm.onlyBuiltDependencies` for the modules that need to compile).

### Develop

```sh
pnpm install
pnpm dev
```

### Build

```sh
pnpm build:win     # Windows installer
pnpm build:mac     # macOS .app + .dmg
pnpm build:linux   # AppImage / snap / deb
```

### Other scripts

```sh
pnpm typecheck     # TypeScript check
pnpm lint          # ESLint
pnpm format        # Prettier
```

## Project structure

```
src/
  main/           Electron main process (Node, filesystem, SQLite)
  preload/        IPC bridge (typed window.api exposed to renderer)
  renderer/       React UI (Vite, TypeScript)
    src/
      types.ts          shared types (Post, Comment)
      lib/              utilities (time, theme, useEditable)
      components/       React components
resources/        runtime assets (icon, etc.)
build/            packaging assets (installer icons)
```

The renderer uses the `@renderer/*` import alias instead of relative paths.

## Roadmap

Prifeed is in early dogfood. Items ship when they're useful, not on a date.

- [ ] **Photo attachments** — drag-drop images stored next to the SQLite file
- [ ] **Search** — full-text search across entries and comments
- [ ] **Archive** — soft-delete with a Trash view (currently delete is permanent)
- [ ] **Markdown / rich text** — formatting in entries
- [ ] **Cloud sync (BYOC)** — encrypted sync via your own Google Drive / Dropbox / WebDAV
- [ ] **Auto-update** — `electron-updater` is wired up but not yet active
- [ ] **Mobile companion (read-only)** — open the same data on your phone
- [ ] **Hosted sync (paid)** — optional managed sync service for users who don't want to plumb cloud accounts

Suggestions and use-case stories are welcome via Issues.

## License

Prifeed is open source under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See [LICENSE](LICENSE) for the full text.

In short: you can read, modify, and self-distribute Prifeed freely. If you offer Prifeed (or a modified version of it) as a network service, the AGPL requires you to publish your source modifications. The "Prifeed" name and logo are not licensed for redistribution under a different brand without permission.

If a future hosted sync service launches, it will be a separate paid offering that does not change the license of the desktop app itself.

## Contributing

Prifeed is in an early phase where the design and data model are still settling. Issues, bug reports, and "I want to use this for X" stories are very welcome. Pull requests are appreciated but please open an issue first for anything beyond a small fix — directional feedback is more useful right now than parallel implementations.
