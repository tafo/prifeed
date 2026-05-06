import { useState } from 'react'
import type { PostWithComments } from '@renderer/types'
import { formatTime } from '@renderer/lib/time'
import { CommentItem } from '@renderer/components/CommentItem'

interface PostCardProps {
  post: PostWithComments
  onChange: () => void
}

export function PostCard({ post, onChange }: PostCardProps): React.JSX.Element {
  const [editing, setEditing] = useState(false)
  const [editBody, setEditBody] = useState('')
  const [composing, setComposing] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')

  const wasEdited = post.updated_at > post.created_at

  function startEdit(): void {
    setEditing(true)
    setEditBody(post.body)
  }

  function cancelEdit(): void {
    setEditing(false)
    setEditBody('')
  }

  async function saveEdit(): Promise<void> {
    const body = editBody.trim()
    if (!body || body === post.body) {
      cancelEdit()
      return
    }
    await window.api.posts.update(post.id, body)
    cancelEdit()
    onChange()
  }

  function handleEditKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  async function handleDelete(): Promise<void> {
    const preview = post.body.length > 60 ? post.body.slice(0, 60) + '...' : post.body
    const ok = window.confirm(`Delete this entry?\n\n"${preview}"\n\nThis cannot be undone.`)
    if (!ok) return
    await window.api.posts.delete(post.id)
    onChange()
  }

  function startCompose(): void {
    setComposing(true)
    setCommentDraft('')
  }

  function cancelCompose(): void {
    setComposing(false)
    setCommentDraft('')
  }

  async function submitComment(): Promise<void> {
    const body = commentDraft.trim()
    if (!body) return
    await window.api.comments.create(post.id, body)
    setCommentDraft('')
    onChange()
  }

  function handleCommentKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      submitComment()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelCompose()
    }
  }

  return (
    <article className="overflow-hidden rounded-md border border-border bg-surface px-5 py-4">
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

      {editing ? (
        <>
          <textarea
            autoFocus
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            onKeyDown={handleEditKeyDown}
            rows={Math.max(3, editBody.split('\n').length)}
            spellCheck={false}
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
                onClick={saveEdit}
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
            <button onClick={startCompose} className="hover:text-accent">
              Comment
              {post.comments.length > 0 && (
                <span className="ml-1 font-mono text-text-faint">
                  · {post.comments.length}
                </span>
              )}
            </button>
            <button onClick={startEdit} className="hover:text-accent">
              Edit
            </button>
            <button onClick={handleDelete} className="hover:text-red-400">
              Delete
            </button>
          </div>

          {(post.comments.length > 0 || composing) && (
            <div className="-mx-5 -mb-4 mt-4 border-t border-border bg-bg/50 px-5 py-3">
              {post.comments.length > 0 && (
                <div className="space-y-3">
                  {post.comments.map((c) => (
                    <CommentItem key={c.id} comment={c} onChange={onChange} />
                  ))}
                </div>
              )}
              {composing && (
                <div className={post.comments.length > 0 ? 'mt-3' : ''}>
                  <textarea
                    autoFocus
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    onKeyDown={handleCommentKeyDown}
                    placeholder="Write a comment..."
                    rows={2}
                    spellCheck={false}
                    className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-[14px] leading-relaxed text-text placeholder:text-text-faint focus:border-border-strong focus:outline-none"
                  />
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-text-faint">
                      ⌘ + Enter · Esc
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={cancelCompose}
                        className="text-xs text-text-muted hover:text-text"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={submitComment}
                        disabled={!commentDraft.trim()}
                        className="rounded-md bg-accent px-2.5 py-0.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </article>
  )
}
