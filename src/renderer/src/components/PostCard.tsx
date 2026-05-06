import { useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Textarea } from '@headlessui/react'
import type { PostWithComments } from '@renderer/types'
import { formatTime } from '@renderer/lib/time'
import { CommentItem } from '@renderer/components/CommentItem'

function CommentIcon(): React.JSX.Element {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function KebabIcon(): React.JSX.Element {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  )
}

interface PostCardProps {
  post: PostWithComments
  onChange: () => void
}

export function PostCard({ post, onChange }: PostCardProps): React.JSX.Element {
  const [editing, setEditing] = useState(false)
  const [editBody, setEditBody] = useState('')
  const [composing, setComposing] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')

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
    <article className="group/post overflow-hidden rounded-md border border-border bg-surface px-5 py-3">
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-text-faint">
        <div className="flex items-baseline gap-2">
          <span className="font-mono">{formatTime(post.created_at)}</span>
          {post.comments.length > 0 && (
            <span>
              · {post.comments.length}{' '}
              {post.comments.length === 1 ? 'comment' : 'comments'}
            </span>
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-0.5 opacity-40 transition-opacity group-hover/post:opacity-100 group-focus-within/post:opacity-100">
            <button
              onClick={startCompose}
              title="Comment"
              aria-label="Comment"
              className="rounded p-1 text-text-muted hover:bg-elevated hover:text-text"
            >
              <CommentIcon />
            </button>

            <Menu>
              <MenuButton
                title="More"
                aria-label="More actions"
                className="rounded p-1 text-text-muted hover:bg-elevated hover:text-text data-open:bg-elevated data-open:text-text data-open:opacity-100"
              >
                <KebabIcon />
              </MenuButton>
              <MenuItems
                anchor="bottom end"
                className="z-20 mt-1 min-w-32 rounded-md border border-border bg-surface py-1 text-[12px] shadow-lg focus:outline-none"
              >
                <MenuItem>
                  <button
                    onClick={startEdit}
                    className="flex w-full items-center px-3 py-1.5 text-left text-text-muted data-focus:bg-elevated data-focus:text-text"
                  >
                    Edit
                  </button>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center px-3 py-1.5 text-left text-text-muted data-focus:bg-elevated data-focus:text-red-400"
                  >
                    Delete
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        )}
      </div>

      {editing ? (
        <>
          <Textarea
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

          {(post.comments.length > 0 || composing) && (
            <div className="-mx-5 -mb-3 mt-3 border-t border-border bg-bg/50 px-5 py-3">
              {post.comments.length > 0 && (
                <div className="space-y-3">
                  {post.comments.map((c) => (
                    <CommentItem key={c.id} comment={c} onChange={onChange} />
                  ))}
                </div>
              )}
              {composing && (
                <div className={post.comments.length > 0 ? 'mt-3' : ''}>
                  <Textarea
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
