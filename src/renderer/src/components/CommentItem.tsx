import { useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Textarea } from '@headlessui/react'
import {
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/16/solid'
import type { Comment } from '@renderer/types'
import { formatTime } from '@renderer/lib/time'

interface CommentItemProps {
  comment: Comment
  onChange: () => void
}

export function CommentItem({ comment, onChange }: CommentItemProps): React.JSX.Element {
  const [editing, setEditing] = useState(false)
  const [editBody, setEditBody] = useState('')

  function startEdit(): void {
    setEditing(true)
    setEditBody(comment.body)
  }

  function cancelEdit(): void {
    setEditing(false)
    setEditBody('')
  }

  async function saveEdit(): Promise<void> {
    const body = editBody.trim()
    if (!body || body === comment.body) {
      cancelEdit()
      return
    }
    await window.api.comments.update(comment.id, body)
    cancelEdit()
    onChange()
  }

  async function handleDelete(): Promise<void> {
    const ok = window.confirm('Delete this comment?')
    if (!ok) return
    await window.api.comments.delete(comment.id)
    onChange()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  if (editing) {
    return (
      <div>
        <Textarea
          autoFocus
          aria-label="Edit comment body"
          value={editBody}
          onChange={(e) => setEditBody(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={Math.max(2, editBody.split('\n').length)}
          spellCheck={false}
          className="w-full resize-none rounded-2xl border-none bg-surface px-3.5 py-2 text-[14px] leading-snug text-text field-sizing-content focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-focus-ring"
        />
        <div className="mt-1 ml-3.5 flex items-center justify-between text-[11px] text-text-faint">
          <span className="font-mono">⌘ + Enter · Esc</span>
          <div className="flex items-center gap-2">
            <button onClick={cancelEdit} className="text-text-muted hover:text-text">
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={!editBody.trim() || editBody.trim() === comment.body}
              className="rounded bg-accent px-2 py-0.5 text-[11px] font-semibold text-white shadow-inner shadow-white/15 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-30"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group/comment flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <div className="inline-block max-w-full rounded-2xl bg-surface px-3.5 py-2">
          <p className="whitespace-pre-wrap text-[14px] leading-snug text-text">
            {comment.body}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-start gap-1 pt-1.5">
        <span className="font-mono text-[11px] whitespace-nowrap text-text-faint">
          {formatTime(comment.created_at)}
        </span>
        <Menu>
          <MenuButton
            title="More"
            aria-label="More actions"
            className="rounded p-0.5 text-text-muted opacity-40 transition-opacity hover:bg-elevated hover:text-text data-open:bg-elevated data-open:text-text data-open:opacity-100"
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
      </div>
    </div>
  )
}
