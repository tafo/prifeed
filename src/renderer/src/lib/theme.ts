import { useEffect, useState } from 'react'

/**
 * What the user picked.
 *
 * - `system`: follow the OS preference
 * - `light`: force light theme
 * - `dark`: force dark theme
 */
export type ThemePreference = 'system' | 'light' | 'dark'

/**
 * The theme applied at runtime. Always concrete.
 */
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'prifeed.theme'

function readPreference(): ThemePreference {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'system' || saved === 'light' || saved === 'dark') return saved
  return 'system'
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.classList.toggle('light', resolved === 'light')
}

interface UseThemeResult {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (p: ThemePreference) => void
}

/**
 * React hook for reading and changing the app theme.
 *
 * The hook saves the user's choice to `localStorage`. When `preference` is
 * `system`, the hook listens for OS theme changes and updates the applied
 * theme live.
 *
 * The hook also adds a `light` or `dark` class to the `<html>` element. The
 * CSS uses this class to swap design tokens.
 *
 * @example
 * const { preference, resolved, setPreference } = useTheme()
 *
 * <button onClick={() => setPreference('dark')}>
 *   Current: {preference} (showing {resolved})
 * </button>
 */
export function useTheme(): UseThemeResult {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference)
  const [resolved, setResolved] = useState<ResolvedTheme>(() => {
    const pref = readPreference()
    return pref === 'system' ? getSystemTheme() : pref
  })

  useEffect(() => {
    const next: ResolvedTheme = preference === 'system' ? getSystemTheme() : preference
    setResolved(next)
    applyTheme(next)
  }, [preference])

  useEffect(() => {
    if (preference !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (): void => {
      const next: ResolvedTheme = mql.matches ? 'dark' : 'light'
      setResolved(next)
      applyTheme(next)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [preference])

  function setPreference(p: ThemePreference): void {
    localStorage.setItem(STORAGE_KEY, p)
    setPreferenceState(p)
  }

  return { preference, resolved, setPreference }
}
