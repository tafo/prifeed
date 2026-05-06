import { useState } from 'react'
import type { Comment } from '@renderer/types'
import { formatTime } from '@renderer/lib/time'

interface CommentItemProps {
  comment: Comment
  onChange: () => void
}

export function CommentItem({ comment, onChange }: CommentItemProps): React.JSX.Element {
  const [editing, setEditing] = useState(false)
  const [editBody, setEditBody] = useState('')

  const wasEdited = comment.updated_at > comment.created_at

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
        <textarea
          autoFocus
          value={editBody}
          onChange={(e) => setEditBody(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={Math.max(2, editBody.split('\n').length)}
          spellCheck={false}
          className="w-full resize-none rounded-2xl border border-border bg-elevated px-3.5 py-2 text-[14px] leading-snug text-text focus:border-border-strong focus:outline-none"
        />
        <div className="ml-3.5 mt-1 flex items-center gap-2 text-[11px] text-text-faint">
          <span className="font-mono">⌘ + Enter · Esc</span>
          <span>·</span>
          <button onClick={cancelEdit} className="hover:text-text">
            Cancel
          </button>
          <span>·</span>
          <button
            onClick={saveEdit}
            disabled={!editBody.trim() || editBody.trim() === comment.body}
            className="text-accent hover:text-accent-hover disabled:cursor-not-allowed disabled:opacity-30"
          >
            Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group">
      <div className="inline-block max-w-full rounded-2xl bg-elevated px-3.5 py-2">
        <p className="whitespace-pre-wrap text-[14px] leading-snug text-text">
          {comment.body}
        </p>
      </div>
      <div className="ml-3.5 mt-1 flex items-center gap-2 text-[11px] text-text-faint">
        <span className="font-mono">{formatTime(comment.created_at)}</span>
        {wasEdited && <span title={`Edited ${formatTime(comment.updated_at)}`}>· edited</span>}
        <span>·</span>
        <button className="hover:text-accent">Like</button>
        <span>·</span>
        <button onClick={startEdit} className="hover:text-accent">
          Edit
        </button>
        <span>·</span>
        <button
          onClick={handleDelete}
          className="opacity-60 transition-opacity hover:text-red-400 group-hover:opacity-100"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
