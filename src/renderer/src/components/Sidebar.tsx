import { PencilSquareIcon } from '@heroicons/react/16/solid'
import { Logo } from '@renderer/components/Logo'
import { ThemeToggle } from '@renderer/components/ThemeToggle'
import type { Filter } from '@renderer/lib/time'

interface Counts {
  all: number
  today: number
  week: number
  month: number
}

interface SidebarProps {
  filter: Filter
  counts: Counts
  onFilterChange: (f: Filter) => void
  onNewEntry: () => void
}

interface FilterItemProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function FilterItem({ label, count, active, onClick }: FilterItemProps): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-sm transition-colors ${
        active
          ? 'bg-elevated text-text'
          : 'text-text-muted hover:bg-elevated/60 hover:text-text'
      }`}
    >
      <span>{label}</span>
      <span className="font-mono text-[11px] text-text-faint">{count}</span>
    </button>
  )
}

export function Sidebar({
  filter,
  counts,
  onFilterChange,
  onNewEntry
}: SidebarProps): React.JSX.Element {
  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-bg">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <Logo />
        <span className="text-base font-semibold text-text">Prifeed</span>
      </div>

      <div className="px-2">
        <button
          onClick={onNewEntry}
          className="flex w-full items-center justify-between rounded-md bg-accent px-2.5 py-1.5 text-sm font-semibold text-white shadow-inner shadow-white/15 transition-colors hover:bg-accent-hover"
        >
          <span className="flex items-center gap-2">
            <PencilSquareIcon className="size-4" />
            New entry
          </span>
          <span className="font-mono text-[10px] text-white/70">⌘N</span>
        </button>
      </div>

      <nav className="mt-3 flex flex-col gap-0.5 px-2">
        <FilterItem
          label="All"
          count={counts.all}
          active={filter === 'all'}
          onClick={() => onFilterChange('all')}
        />
        <FilterItem
          label="Today"
          count={counts.today}
          active={filter === 'today'}
          onClick={() => onFilterChange('today')}
        />
        <FilterItem
          label="This week"
          count={counts.week}
          active={filter === 'week'}
          onClick={() => onFilterChange('week')}
        />
        <FilterItem
          label="This month"
          count={counts.month}
          active={filter === 'month'}
          onClick={() => onFilterChange('month')}
        />
      </nav>

      <div className="mt-auto flex items-center justify-between gap-2 px-3 py-3">
        <span className="font-mono text-[11px] text-text-faint">local · private</span>
        <ThemeToggle />
      </div>
    </aside>
  )
}
