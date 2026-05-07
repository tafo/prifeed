import type { PostWithComments } from '@renderer/types'

interface PostCardProps {
  post: PostWithComments
  selected: boolean
  onSelect: (id: string) => void
}

export function PostCard({ post, selected, onSelect }: PostCardProps): React.JSX.Element {
  return (
    <article
      onClick={() => onSelect(post.id)}
      className={`cursor-pointer rounded-xl border bg-surface px-4 py-3 transition-colors ${
        selected ? 'border-accent' : 'border-border hover:border-border-strong'
      }`}
    >
      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text">
        {post.body}
      </p>
    </article>
  )
}
