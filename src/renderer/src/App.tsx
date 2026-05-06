import { useEffect, useRef, useState } from 'react'

interface Post {
  id: string
  body: string
  created_at: number
  updated_at: number
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }
  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
    hour: '2-digit',
    minute: '2-digit'
  })
}

function App(): React.JSX.Element {
  const [posts, setPosts] = useState<Post[]>([])
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function refresh(): Promise<void> {
    const list = await window.api.posts.list()
    setPosts(list)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function submit(): Promise<void> {
    const body = draft.trim()
    if (!body) return
    setSubmitting(true)
    try {
      await window.api.posts.create(body)
      setDraft('')
      await refresh()
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

  async function handleDelete(post: Post): Promise<void> {
    const preview = post.body.length > 60 ? post.body.slice(0, 60) + '...' : post.body
    const ok = window.confirm(`Delete this entry?\n\n"${preview}"\n\nThis cannot be undone.`)
    if (!ok) return
    await window.api.posts.delete(post.id)
    await refresh()
  }

  function startEdit(post: Post): void {
    setEditingId(post.id)
    setEditBody(post.body)
  }

  function cancelEdit(): void {
    setEditingId(null)
    setEditBody('')
  }

  async function saveEdit(post: Post): Promise<void> {
    const body = editBody.trim()
    if (!body || body === post.body) {
      cancelEdit()
      return
    }
    await window.api.posts.update(post.id, body)
    cancelEdit()
    await refresh()
  }

  function handleEditKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>, post: Post): void {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      saveEdit(post)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  return (
    <div className="min-h-full bg-bg">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3">
          <h1 className="text-base font-semibold text-text">Prifeed</h1>
          <span className="font-mono text-xs text-text-faint">
            {posts.length} {posts.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <section className="mb-6">
          <div className="rounded-md border border-border bg-surface transition-colors focus-within:border-border-strong">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-relaxed text-text placeholder:text-text-faint focus:outline-none"
            />
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <span className="font-mono text-[11px] text-text-faint">
                ⌘ + Enter to post
              </span>
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

        <section className="space-y-4">
          {posts.length === 0 && (
            <p className="py-8 text-center text-sm text-text-faint">No entries yet.</p>
          )}
          {posts.map((post) => {
            const isEditing = editingId === post.id
            const wasEdited = post.updated_at > post.created_at
            return (
              <article
                key={post.id}
                className="rounded-md border border-border bg-surface px-5 py-4"
              >
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="font-mono text-[11px] text-text-faint">
                    {formatTime(post.created_at)}
                  </span>
                  {wasEdited && (
                    <span
                      className="font-mono text-[11px] text-text-faint"
                      title={`Edited ${formatTime(post.updated_at)}`}
                    >
                      · edited
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <>
                    <textarea
                      autoFocus
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, post)}
                      rows={Math.max(3, editBody.split('\n').length)}
                      className="w-full resize-none rounded-sm border border-border bg-elevated px-3 py-2 text-[15px] leading-relaxed text-text focus:border-border-strong focus:outline-none"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-text-faint">
                        ⌘ + Enter to save · Esc to cancel
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={cancelEdit}
                          className="rounded-md px-3 py-1 text-xs font-medium text-text-muted hover:text-text"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(post)}
                          disabled={!editBody.trim() || editBody.trim() === post.body}
                          className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text">
                      {post.body}
                    </p>
                    <div className="mt-3 flex gap-4 text-[12px] text-text-muted">
                      <button className="hover:text-accent">Like</button>
                      <button className="hover:text-accent">Comment</button>
                      <button onClick={() => startEdit(post)} className="hover:text-accent">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post)}
                        className="hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            )
          })}
        </section>
      </div>
    </div>
  )
}

export default App
