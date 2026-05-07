---
name: premium-ui-design
description: Use when designing or refining any visual surface in the Prifeed renderer. Triggers on changes to .tsx files in src/renderer/, Tailwind class edits, theme tokens, typography, spacing, color, focus, hover, scrollbars, or animations. Also triggers when the user mentions "feel", "premium", "polish", "design", "spacing", "typography", "look", or asks to make something nicer or more original. Apply this even on small touch-ups. Cohesion comes from many small choices, and originality comes from refusing the default.
---

# Premium UI design

Prifeed is a private journal. The surface a person sees most days is their own writing. The interface holds that writing without competing with it.

The user wants an original visual identity, not a clone of any tool, dashboard, or note app. Refuse the SaaS default at every fork.

## Refuse defaults

Before adding anything, ask: "Would a generic CRUD app do this?" If yes, do not ship it. Examples of defaults to refuse:

- Card with rounded corners, drop shadow, and a border on a flat background.
- Settings cog top right, avatar bottom left, plus button bottom right.
- Toast that slides in from the bottom corner.
- Linear gradient on an accent button.
- Sidebar with icons + labels and a collapsed mode.
- Modal with a centered title, two buttons, and a backdrop blur of 8px.

These are not wrong. They are tired. Find a choice with a reason behind it that fits a personal journal, then commit.

## Theme tokens (only source of truth)

All color comes from the `@theme` block in `src/renderer/src/assets/main.css`. Never hardcode hex in components. Use the token utilities:

- `bg-bg`, `bg-surface`, `bg-elevated` (background layers, lightest at top)
- `text-text`, `text-text-muted`, `text-text-faint` (text by importance)
- `border-border` (only divider color)
- `bg-accent`, `bg-accent-hover`, `text-accent`
- `outline-focus-ring` (focus only)

Light vs dark is a class on `<html>` (`.light` or `.dark`). Tokens swap. Never branch on theme inside a component.

If a new color is truly needed, add it as a token first. Adding tokens is a design decision, not a per-component fix.

## Typography

Body font: `Geist Variable`. Mono: `Geist Mono`. Bundled via `@fontsource-variable`. Never load fonts from a CDN, that breaks the privacy promise.

- Body sizes already in the app: `text-[14px]` for lists and comments, `text-[15px]` for post body and thread.
- Meta: `text-[11px]` for timestamps, day labels, counts.
- Mono is for time and keyboard hints only.
- Body line height: `leading-relaxed`.
- Weight: `400` for body, `500` or `600` for emphasis. Never bold inside a paragraph.
- Tabular numerals for time and counts.

Type is the strongest carrier of identity. If you change a size, change all instances of that role together. Drift makes the surface feel cheap.

## Spacing scale

Pick from a small set. Mixed values make layouts feel busy.

- `gap-1` `gap-2` for icon and label
- `gap-3` `gap-4` for fields and rows
- `px-4` `px-5` for content padding
- `py-3` `py-4` for row vertical padding
- `mb-5` `mb-8` for section breaks

If a layout asks for an unusual gap, surface it before adding it.

## Composition

- Single content column for the timeline. `max-w-3xl mx-auto`.
- Right panel (`ThreadPanel`) is a fixed-width sticky aside (`w-[42rem]`).
- App shell is `h-screen` with each column scrolling on its own (`overflow-y-auto`). The page itself does not scroll. That breaks sticky elements.
- Day groups separate with a small label and `mb-8`. Inside a day, rows sit close.
- Hairline separators are explicit divs: `<div className="h-px bg-border ml-4" />`. Avoid `divide-y`, indent does not match.

A journal reads top to bottom. The eye should fall straight down with no horizontal noise.

## Icons

Heroicons `@heroicons/react/16/solid` only. Use `size-4` (16px) inline. Do not mix outline and solid in the same surface. Pick one per surface and stay there.

Emoji in chrome is forbidden. Emoji inside a user's post body is theirs to use.

## Motion

Motion is signal, not decoration.

- Default: no animation.
- Add motion when it explains a state change (item entered the list, panel opened, save succeeded).
- Allowed transitions: `transition-colors duration-150`, dialog enter/leave (Headless UI built-in).
- One signal animation: a new post entering the timeline gets a brief fade-in. This confirms "your entry is here".
- Never scale or rotate on hover.
- Never animate body text appearing.

## Focus

Keyboard users see focus, mouse users do not. Use Headless UI `data-focus` for primitives:

```tsx
className="focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-focus-ring"
```

For plain elements use `:focus-visible` with the same tokens.

## Reusable patterns (use, do not rebuild)

- `useEditable(initial, save, resetKey)` for inline edit with `Cmd+Enter` to save and `Esc` to cancel.
- `KebabMenu` for row actions. Pass `items: { label, icon, onClick, destructive? }[]`.
- `ConfirmDialog` for destructive confirmation. Title is a question. Body is one short line of consequence.
- `Markdown` for any user body text. Wraps `react-markdown` and applies `.prose-md`.
- Auto-grow textareas use `field-sizing-content` plus `resize-none`.

If a need does not fit these, ask before inventing a new pattern. New patterns scatter the design.

## Inputs and buttons

Inputs:
- Background `bg-elevated`, not `bg-surface`. Inputs sit one layer above their container.
- No visible border. Outline only on focus.
- `rounded-lg` for textareas and inputs.

Buttons, three roles only:
- Primary: `bg-accent hover:bg-accent-hover text-white shadow-inner shadow-white/15 rounded-md`
- Ghost: `text-text-muted hover:text-text hover:bg-elevated rounded-md`
- Destructive: routed through `ConfirmDialog`. No red button in the row.

Disabled: `disabled:opacity-30 disabled:cursor-not-allowed`.

## Keyboard hints

Visible shortcut hints use `font-mono text-[11px] text-text-faint`. Already in the app:

- `Cmd+Enter to save · Esc to cancel`
- `Cmd+Enter to send`

Keep the dot separator and the same font. This pattern is part of the identity, do not vary it.

## Originality test

Before merging a new surface, look at it next to the rest of the app and answer:

1. Does this look like it belongs to Prifeed and only Prifeed, or could it ship in any note app?
2. Is there one detail a user would describe to a friend?
3. Did I add anything that the existing tokens, components, or scale do not already cover? If yes, was that addition discussed?

If the answers are weak, the surface is not done.

## What to avoid

- Hardcoded hex in components.
- Gradient backgrounds. Solid tokens, one accent.
- Drop shadows on timeline rows. Shadows are for floating elements only.
- Multiple font weights in one paragraph.
- Bold for emphasis in body.
- Hover effects that move or scale.
- New theme tokens, fonts, or radii without discussion.
- Generic empty states ("Nothing here yet" with a centered icon). Empty states are an opportunity to express identity. Treat them as designed surfaces, not placeholders.

## Checklist

- [ ] No hardcoded color
- [ ] Spacing values come from the small set
- [ ] Typography uses sizes already in the app
- [ ] Focus uses `data-focus` or `:focus-visible`
- [ ] Light and dark both look right
- [ ] Keyboard shortcuts still work (`Cmd+N`, `Cmd+Enter`, `Esc`)
- [ ] Slim scrollbars preserved on any new scroll container
- [ ] No CDN font, no remote asset
- [ ] Passed the originality test above
