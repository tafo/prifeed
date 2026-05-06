import { useRef, useState } from 'react'

interface PostComposerProps {
  onPosted: () => void
}

export function PostComposer({ onPosted }: PostComposerProps): React.JSX.Element {
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function submit(): Promise<void> {
    const body = draft.trim()
    if (!body) return
    setSubmitting(true)
    try {
      await window.api.posts.create(body)
      setDraft('')
      onPosted()
      textareaRef.current?.focus()
    } finally {
      setSubmitting(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  return (
    <section className="mb-6">
      <div className="rounded-md border border-border bg-surface transition-colors focus-within:border-border-strong">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          rows={3}
          spellCheck={false}
          className="w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-relaxed text-text placeholder:text-text-faint focus:outline-none"
        />
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <span className="font-mono text-[11px] text-text-faint">⌘ + Enter to post</span>
          <button
            onClick={submit}
            disabled={submitting || !draft.trim()}
            className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-30"
          >
            Post
          </button>
        </div>
      </div>
    </section>
  )
}
