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
      className={`cursor-pointer overflow-hidden rounded-xl border bg-surface px-5 py-4 transition-colors ${
        selected ? 'border-accent' : 'border-border hover:border-border-strong'
      }`}
    >
      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text">
        {post.body}
      </p>
    </article>
  )
}
