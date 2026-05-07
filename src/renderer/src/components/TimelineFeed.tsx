import type { PostWithComments } from '@renderer/types'

interface TimelineFeedProps {
  posts: PostWithComments[]
  selectedId: string | null
  onSelect: (id: string) => void
}

interface DayGroup {
  label: string
  items: PostWithComments[]
}

function getDayLabel(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const dStart = new Date(d)
  dStart.setHours(0, 0, 0, 0)

  if (dStart.getTime() === today.getTime()) return 'Today'
  if (dStart.getTime() === yesterday.getTime()) return 'Yesterday'

  const dayDiff = Math.round((today.getTime() - dStart.getTime()) / 86400000)
  if (dayDiff > 0 && dayDiff < 7) {
    return d.toLocaleDateString(undefined, { weekday: 'long' })
  }
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function groupByDay(posts: PostWithComments[]): DayGroup[] {
  const groups: DayGroup[] = []
  let current: DayGroup | null = null
  for (const post of posts) {
    const label = getDayLabel(post.created_at)
    if (!current || current.label !== label) {
      current = { label, items: [post] }
      groups.push(current)
    } else {
      current.items.push(post)
    }
  }
  return groups
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export function TimelineFeed({
  posts,
  selectedId,
  onSelect
}: TimelineFeedProps): React.JSX.Element {
  const groups = groupByDay(posts)

  return (
    <div className="mx-auto max-w-3xl">
      {groups.map((group) => (
        <div key={group.label} className="mb-8 last:mb-0">
          <div className="mb-2 flex items-center gap-3 px-4">
            <span className="text-[11px] font-semibold tracking-wider text-text-faint uppercase">
              {group.label}
            </span>
            <div className="flex-1 border-t border-border" />
          </div>
          <div>
            {group.items.map((post, i) => {
              const selected = selectedId === post.id
              return (
                <div key={post.id}>
                  {i > 0 && <div className="ml-4 h-px bg-border" />}
                  <div
                    onClick={() => onSelect(post.id)}
                    className={`flex cursor-pointer items-start gap-4 border-l-4 px-4 py-3 transition-colors ${
                      selected
                        ? 'border-accent bg-elevated'
                        : 'border-transparent hover:border-emerald-400'
                    }`}
                  >
                    <span className="w-12 shrink-0 pt-0.5 font-mono text-[13px] text-text-faint">
                      {formatTime(post.created_at)}
                    </span>
                    <p className="min-w-0 flex-1 whitespace-pre-wrap text-[14px] leading-relaxed text-text">
                      {post.body}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
