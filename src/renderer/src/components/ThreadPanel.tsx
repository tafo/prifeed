import { useEffect, useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Textarea } from '@headlessui/react'
import {
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/16/solid'
import type { PostWithComments } from '@renderer/types'
import { formatTime } from '@renderer/lib/time'
import { CommentItem } from '@renderer/components/CommentItem'

interface ThreadPanelProps {
  post: PostWithComments
  onChange: () => void
  onClose: () => void
}

export function ThreadPanel({
  post,
  onChange,
  onClose
}: ThreadPanelProps): React.JSX.Element {
  const [editing, setEditing] = useState(false)
  const [editBody, setEditBody] = useState('')
  const [commentDraft, setCommentDraft] = useState('')

  // Reset edit state when switching posts
  useEffect(() => {
    setEditing(false)
    setEditBody('')
  }, [post.id])

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
    }
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[42rem] shrink-0 flex-col border-l border-border bg-surface">
      <header className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
        <div className="flex items-center gap-2 text-[11px] text-text-faint">
          <span className="font-mono whitespace-nowrap">
            {formatTime(post.created_at)}
          </span>
          {post.comments.length > 0 && (
            <span
              title={`${post.comments.length} ${
                post.comments.length === 1 ? 'comment' : 'comments'
              }`}
              className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white"
            >
              {post.comments.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!editing && (
            <Menu>
              <MenuButton
                title="More"
                aria-label="More actions"
                className="rounded p-1 text-text-muted hover:bg-elevated hover:text-text data-open:bg-elevated data-open:text-text"
              >
                <EllipsisHorizontalIcon className="size-4" />
              </MenuButton>
              <MenuItems
                transition
                anchor="bottom end"
                className="z-20 w-40 origin-top-right rounded-xl border border-border bg-elevated p-1 text-[13px] text-text shadow-xl transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
              >
                <MenuItem>
                  <button
                    onClick={startEdit}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left data-focus:bg-border-strong"
                  >
                    <PencilIcon className="size-4 text-text-muted" />
                    Edit
                  </button>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left data-focus:bg-border-strong data-focus:text-red-400"
                  >
                    <TrashIcon className="size-4 text-text-muted" />
                    Delete
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          )}
          <button
            onClick={onClose}
            aria-label="Close thread"
            className="rounded p-1 text-text-muted hover:bg-elevated hover:text-text"
          >
            <XMarkIcon className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {editing ? (
          <>
            <Textarea
              autoFocus
              aria-label="Edit post body"
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              onKeyDown={handleEditKeyDown}
              rows={Math.max(3, editBody.split('\n').length)}
              spellCheck={false}
              className="w-full resize-none rounded-lg border-none bg-elevated px-3 py-2 text-[15px] leading-relaxed text-text focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-focus-ring"
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
                  className="rounded-md bg-accent px-3 py-1 text-xs font-semibold text-white shadow-inner shadow-white/15 transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Save
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="mb-5 whitespace-pre-wrap text-[15px] leading-relaxed text-text">
            {post.body}
          </p>
        )}

        {!editing && (
          <div className="border-t border-border pt-4">
            <Textarea
              aria-label="Write a comment"
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              onKeyDown={handleCommentKeyDown}
              placeholder="Add a comment..."
              rows={2}
              spellCheck={false}
              className="w-full resize-none rounded-lg border-none bg-elevated px-3 py-2 text-[14px] leading-relaxed text-text placeholder:text-text-faint focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-focus-ring"
            />
            {commentDraft.trim() && (
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[11px] text-text-faint">
                  ⌘ + Enter to send
                </span>
                <button
                  onClick={submitComment}
                  className="rounded-md bg-accent px-3 py-1 text-xs font-semibold text-white shadow-inner shadow-white/15 transition-colors hover:bg-accent-hover"
                >
                  Send
                </button>
              </div>
            )}

            {post.comments.length > 0 && (
              <div className="mt-5 space-y-3">
                {post.comments.map((c) => (
                  <CommentItem key={c.id} comment={c} onChange={onChange} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
