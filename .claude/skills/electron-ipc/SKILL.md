---
name: electron-ipc
description: Use when adding, modifying, or debugging IPC (inter-process communication) between Electron's main process and the React renderer. Triggers on changes to src/main/, src/preload/, window.api calls in the renderer, ipcMain.handle, ipcRenderer.invoke, or any cross-process function call. Also triggers when the user mentions "expose to renderer", "IPC channel", "preload bridge", "contextBridge", or talks about how the UI talks to the database/filesystem.
---

# Electron IPC for Prifeed

The renderer is sandboxed. It cannot read files, talk to SQLite, or call Node APIs directly. Every cross-process call goes through three layers, and all three must be in sync.

## The contract is a triangle

```
src/main/ipc/<feature>.ts        ← handler runs here (Node)
src/preload/index.ts             ← bridge exposes a typed function
src/renderer/src/types.ts        ← renderer sees window.api.<name>(...)
```

If you change one, change all three. A mismatch fails silently at runtime. TypeScript will not catch it because the bridge crosses a process boundary.

## Adding a new IPC channel

Imagine you want to add `searchPosts(query: string): Promise<Post[]>`.

### 1. Define the handler in main

```ts
// src/main/ipc/posts.ts
import { ipcMain } from 'electron'
import { db } from '../db'
import type { Post } from '../../shared/types'

export function registerPostHandlers(): void {
  ipcMain.handle('posts:search', async (_event, query: string): Promise<Post[]> => {
    // ALWAYS validate input. The renderer is untrusted.
    if (typeof query !== 'string') throw new Error('query must be a string')
    if (query.length > 1000) throw new Error('query too long')

    const stmt = db.prepare('SELECT * FROM posts WHERE body LIKE ? LIMIT 100')
    return stmt.all(`%${query}%`) as Post[]
  })
}
```

Channel naming: `<domain>:<action>`. Examples: `posts:list`, `posts:create`, `media:save`, `db:export`. Use lowercase, colon-separated. Never use spaces or slashes.

### 2. Expose it in preload

```ts
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'
import type { Post } from '../shared/types'

const api = {
  posts: {
    list: (): Promise<Post[]> => ipcRenderer.invoke('posts:list'),
    search: (query: string): Promise<Post[]> => ipcRenderer.invoke('posts:search', query),
    // ... rest
  }
}

contextBridge.exposeInMainWorld('api', api)
export type Api = typeof api
```

### 3. Type it for the renderer

```ts
// src/renderer/src/types.ts (or src/preload/index.d.ts)
import type { Api } from '../../preload'

declare global {
  interface Window {
    api: Api
  }
}
```

### 4. Use it

```ts
// src/renderer/src/components/SearchBar.tsx
const results = await window.api.posts.search(query)
```

## Hard rules

1. **Never use `ipcRenderer.send` + `ipcMain.on`.** That is fire-and-forget and has no return value. Use `invoke` + `handle` always. They return a Promise.

2. **Never expose `ipcRenderer` directly to the renderer.** That breaks context isolation. Always wrap in `contextBridge`.

3. **Never trust renderer input.** Validate types, lengths, and formats in the handler. The renderer is the same trust level as a remote browser tab. Assume it can be compromised by a bad paste.

4. **Never pass functions, class instances, or DOM nodes through IPC.** Only JSON-serializable data crosses the bridge. Date objects become strings, so use ISO strings or epoch ms explicitly to avoid surprises.

5. **No `nodeIntegration: true`. No `contextIsolation: false`.** Ever. If a tutorial says to disable these, ignore it. They are the security boundary.

6. **One handler per channel.** Calling `ipcMain.handle('posts:list', ...)` twice throws at runtime. Register each channel in exactly one place.

## Errors

When a handler throws, the renderer's `await` rejects with a stringified error. Wrap renderer calls in try/catch when the failure is recoverable. For unrecoverable errors (DB corrupted, disk full), let the error propagate to a top-level error boundary.

```ts
// renderer
try {
  const posts = await window.api.posts.list()
} catch (e) {
  // e is a plain Error with .message. The original stack is lost across the bridge.
  showToast('Could not load posts')
}
```

## Async, streams, and large data

- For lists under ~10k rows, return them in one shot.
- For larger data or progress reporting, use `webContents.send` from main + `ipcRenderer.on` in preload (wrap in a typed event API). Tell the user before introducing this. It is more complex.
- Never block the main process for more than ~16ms. SQLite reads are usually fine; large file reads should be streamed or moved to a worker.

## Checklist before merging IPC changes

- [ ] Handler validates all inputs (type + bounds)
- [ ] Channel name follows `<domain>:<action>`
- [ ] Preload bridge exposes the typed function
- [ ] Renderer types updated (`window.api` autocompletes)
- [ ] No `ipcRenderer` leaked to the renderer
- [ ] Return value is JSON-serializable (no Date objects, no class instances)
- [ ] If destructive (delete, overwrite), the handler has a confirmation step OR the renderer requires explicit user action
