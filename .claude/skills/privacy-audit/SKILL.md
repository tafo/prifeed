---
name: privacy-audit
description: Use before merging any change that adds dependencies, network code, file writes outside the user-data folder, telemetry hooks, error reporting services, analytics, or auto-update logic. Triggers on changes to package.json, electron.vite.config.ts, BrowserWindow options, fetch/XMLHttpRequest/axios usage, any URL string, electron-updater configuration, or anywhere the words "track", "analytics", "telemetry", "report", "send" appear in new code. Also triggers when the user asks "is this private?", "does this leak data?", or anything similar.
---

# Privacy audit for Prifeed

The README makes five public promises:

1. No accounts.
2. No servers.
3. No telemetry.
4. No vendor lock-in (data is plain SQLite + media files).
5. Open source. Anyone can verify.

Every PR that touches network, storage, or dependencies must preserve all five. This skill is the checklist.

## What to grep for

When auditing a diff, search for these strings and inspect every match:

- `fetch(`
- `XMLHttpRequest`
- `axios`
- `node-fetch`
- `http.request`, `https.request`
- `WebSocket`
- `navigator.sendBeacon`
- `new URL(`
- Any string starting with `http://` or `https://` (other than docs/comments)
- `crashReporter`
- `app.setAsDefaultProtocolClient` (URL handling)
- `electron-updater`: check if it auto-runs on app start

If a match is unexpected, ask the contributor what it is for. There is no "small" exception.

## Allowed network operations

There is a very short list:

- **`electron-updater`**: checks GitHub Releases for new versions. Must be opt-in via a setting, default OFF until the user enables it. Must not send anything beyond what the GitHub API receives by default (a User-Agent and the request URL). No usage stats, no machine fingerprint.
- **User-initiated cloud sync** (future): Bring-Your-Own-Cloud only. The user supplies credentials for their own Google Drive / Dropbox / WebDAV. Prifeed servers are never in the path.

That is the entire list. Anything else is a violation.

## Forbidden, even if "anonymous"

- Sentry, Bugsnag, Rollbar, or any error reporting SaaS.
- Mixpanel, Amplitude, PostHog, Segment, or any analytics SaaS.
- Google Fonts loaded at runtime (ship the font file).
- CDN imports in the renderer (`<script src="https://...">`).
- Any "phone home" check, even for "is the user behind a firewall" diagnostics.
- Crash reporters that upload anywhere.

"It's just a count of how many users we have" is not a counter-argument. The promise is **no telemetry**, full stop.

## File-write boundaries

Prifeed should only write to:

- The OS user-data folder (returned by `app.getPath('userData')`). This is where the SQLite file and the media folder live.
- The OS log folder (`app.getPath('logs')`), if logging is added. Logs must never contain entry content or comments.
- A user-chosen export path, when the user actively triggers an export.

It should NEVER write to:

- The app install directory (Program Files, /Applications).
- The user's Documents, Desktop, or home folder, unless they explicitly chose that path in a save dialog.
- Temp directories, except for genuinely temporary work that is cleaned up before the function returns.

## Logging

If logs are added, three rules:

1. Never log entry content or comment content. Log IDs and counts only.
2. Never log file paths that contain user-identifiable folder names. Log `userData/posts.db` not `/Users/alice/Library/Application Support/Prifeed/posts.db`.
3. Default log level is `error`. `info` and `debug` only when the user enables a "developer mode" toggle.

## Dependencies

When `package.json` changes, check the new dependency for:

- **License**: AGPL-3.0 compatible (MIT, BSD, Apache-2.0, ISC, Unlicense, AGPL-3.0). NOT compatible: GPL-2.0-only (without "or later"), proprietary, anything with a custom EULA.
- **Network behavior at install or runtime**: does it phone home? Run `npm view <pkg>` and read the description. Search GitHub for "telemetry" in the package's repo.
- **Postinstall scripts**: a postinstall script that fetches a remote binary is a supply-chain risk. Inspect it.
- **Maintenance status**: a single-maintainer package abandoned for 3 years is a liability for a long-lived journal app. Prefer well-maintained alternatives.

## BrowserWindow security defaults

Every `new BrowserWindow(...)` call must have these options:

```ts
new BrowserWindow({
  webPreferences: {
    contextIsolation: true,        // MUST be true
    nodeIntegration: false,        // MUST be false
    sandbox: true,                 // SHOULD be true (preload still works)
    webSecurity: true,             // MUST be true
    allowRunningInsecureContent: false,
    preload: path.join(__dirname, '../preload/index.js')
  }
})
```

If a PR sets any of these to a less-safe value, reject it.

## Content Security Policy

The renderer should ship with a strict CSP that forbids remote sources:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: file:; font-src 'self'; connect-src 'self';">
```

`'unsafe-inline'` for styles is acceptable because Tailwind injects styles. `connect-src 'self'` blocks fetch to any remote origin. This is the seatbelt that catches accidental leaks.

If a feature requires loosening the CSP, that is a privacy review item. Surface it to the user.

## The audit walk

When reviewing a diff:

1. Scan for the grep patterns above.
2. Check every URL string. If it points anywhere except localhost or a documented allowed host, flag it.
3. Check `package.json` diff. Run a license check on new dependencies.
4. Check for new file writes outside the user-data folder.
5. Check that BrowserWindow options were not loosened.
6. Check that the CSP was not loosened.
7. Run the app, open DevTools Network tab, perform the new feature's actions. Confirm no network requests except the explicitly allowed list.

## Final checklist

- [ ] No new `fetch` / `axios` / `http` calls (or each one is justified and documented)
- [ ] No new dependency that runs network code at import time
- [ ] No telemetry, analytics, or error reporting SaaS added
- [ ] All file writes go to allowed paths
- [ ] BrowserWindow security options unchanged or strengthened
- [ ] CSP unchanged or strengthened
- [ ] DevTools Network tab is empty when the feature runs
- [ ] If a network call IS justified, it is opt-in with a default-off setting
