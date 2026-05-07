<div align="center">
  <img src="resources/icons/icon-d-t-letter.svg" width="96" height="96" alt="Prifeed" />

  <h1>Prifeed</h1>

  <p><strong>A local-first, private journal feed. Your thoughts, your machine, your timeline.</strong></p>

  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="License: AGPL-3.0" /></a>
    <a href="https://www.electronjs.org/"><img src="https://img.shields.io/badge/Electron-39-47848F?logo=electron&logoColor=white" alt="Electron 39" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  </p>
</div>

---

Prifeed is a desktop app. It is a personal journal with a timeline feed. You can write notes, comment on past entries, and add photos (soon). Your data stays on your computer.

There are no accounts. There are no servers. There is no telemetry. The data is a SQLite file and a media folder. You can copy it, back it up, or move it to another machine.

Many people use private social accounts as a notebook. The timeline format works well for this. But one wrong click can make a private note public. Prifeed gives you the same timeline format without that risk.

## Privacy commitment

- **No accounts.** No sign-up. No email. No login.
- **No servers.** Your data stays on your device.
- **No telemetry.** The app does not send any data to a server.
- **No vendor lock-in.** Your entries are plain SQLite and media files. To export, copy the folder.
- **Open source.** Read the code. Build it yourself. Check every claim above.

Optional sync will be **bring-your-own-cloud**. Prifeed will talk to your Google Drive, Dropbox, or your own server. We will not see your data.

## Screenshots

> _Screenshots coming soon._

## Features

- 📜 **Timeline feed**: entries grouped by day (Today, Yesterday, weekday, date)
- 💬 **Threaded comments**: leave comments on your own entries
- ✏️ **Edit and delete**: with a clean in-app confirmation
- 🌗 **Light, dark, and system themes**: Atom One Dark and GitHub Light inspired
- ⌨️ **Keyboard-friendly**: `⌘N` (or `Ctrl+N`) to write, `⌘+Enter` to post, `Esc` to cancel
- 🪶 **Premium minimalist UI**: Phoenix-inspired typography, slim scrollbars, auto-grow text fields
- 🔒 **Local-first storage**: better-sqlite3 file in your OS user-data folder

## Tech stack

- **[Electron 39](https://www.electronjs.org/)**: cross-platform desktop runtime
- **[React 19](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/)**: UI
- **[Vite 7](https://vitejs.dev/)** via **[electron-vite](https://electron-vite.org/)**: bundler
- **[Tailwind CSS v4](https://tailwindcss.com/)**: styling
- **[Headless UI v2](https://headlessui.com/)** + **[Heroicons](https://heroicons.com/)**: accessible primitives
- **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)**: local data storage
- **[pnpm](https://pnpm.io/)**: package manager

## Getting started

### Prerequisites

- Node.js (LTS recommended)
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)
- On Windows, a build chain for native modules. See `package.json` `pnpm.onlyBuiltDependencies` for the modules that need to compile.

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

Prifeed is in early dogfood. Items ship when they are useful. There are no fixed dates.

- [ ] **Photo attachments**: drag-drop images stored next to the SQLite file
- [ ] **Search**: full-text search across entries and comments
- [ ] **Archive**: soft-delete with a Trash view (delete is permanent for now)
- [ ] **Markdown / rich text**: formatting in entries
- [ ] **Cloud sync (BYOC)**: encrypted sync to your own Google Drive, Dropbox, or WebDAV
- [ ] **Auto-update**: `electron-updater` is wired up but not active yet
- [ ] **Mobile companion (read-only)**: open the same data on your phone
- [ ] **Hosted sync (paid)**: optional managed sync service for users who do not want to set up cloud accounts

Suggestions and use-case stories are welcome via Issues.

## License

Prifeed is open source under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See [LICENSE](LICENSE) for the full text.

In short: you can read, modify, and self-distribute Prifeed for free. If you offer Prifeed (or a modified version) as a network service, AGPL requires you to publish your source modifications. The "Prifeed" name and logo are not licensed for redistribution under a different brand without permission.

If a hosted sync service launches later, it will be a separate paid offering. The desktop app license will not change.

## Contributing

Prifeed is in an early phase. The design and data model are still settling. Issues, bug reports, and "I want to use this for X" stories are very welcome. Pull requests are appreciated. Please open an issue first for anything beyond a small fix. Directional feedback is more useful right now than parallel implementations.
