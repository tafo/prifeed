import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownProps {
  children: string
  className?: string
}

/**
 * Render a markdown string as React elements.
 *
 * Uses CommonMark plus GFM (tables, task lists, strikethrough, autolinks).
 * Raw HTML in the input is not rendered, so the output is safe by default.
 *
 * @example
 * <Markdown>{post.body}</Markdown>
 */
export function Markdown({ children, className = '' }: MarkdownProps): React.JSX.Element {
  return (
    <div className={`prose-md ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}
