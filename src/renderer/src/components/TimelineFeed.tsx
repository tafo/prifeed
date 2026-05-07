import type { PostWithComments } from '@renderer/types'
import { formatClock, groupByDay } from '@renderer/lib/time'
import { Markdown } from '@renderer/components/Markdown'

interface TimelineFeedProps {
  posts: PostWithComments[]
  selectedId: string | null
  onSelect: (id: string) => void
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
                      {formatClock(post.created_at)}
                    </span>
                    <Markdown className="min-w-0 flex-1 text-[14px] leading-relaxed text-text">
                      {post.body}
                    </Markdown>
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
