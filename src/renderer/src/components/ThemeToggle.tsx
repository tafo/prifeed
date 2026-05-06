import { ComputerDesktopIcon, MoonIcon, SunIcon } from '@heroicons/react/16/solid'
import { useTheme, type ThemePreference } from '@renderer/lib/theme'

const cycle: Record<ThemePreference, ThemePreference> = {
  system: 'light',
  light: 'dark',
  dark: 'system'
}

const labels: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark'
}

export function ThemeToggle(): React.JSX.Element {
  const { preference, setPreference } = useTheme()
  const Icon =
    preference === 'system' ? ComputerDesktopIcon : preference === 'light' ? SunIcon : MoonIcon

  return (
    <button
      onClick={() => setPreference(cycle[preference])}
      title={`Theme: ${labels[preference]} — click to cycle`}
      className="flex items-center gap-2 rounded px-2 py-1 text-[12px] text-text-muted transition-colors hover:bg-elevated hover:text-text"
    >
      <Icon className="size-3.5" />
      <span>{labels[preference]}</span>
    </button>
  )
}
