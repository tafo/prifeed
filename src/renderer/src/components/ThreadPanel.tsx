import { useState } from 'react'
import { Textarea } from '@headlessui/react'
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/16/solid'
import type { PostWithComments } from '@renderer/types'
import { useEditable } from '@renderer/lib/useEditable'
import { CommentItem } from '@renderer/components/CommentItem'
import { ConfirmDialog } from '@renderer/components/ConfirmDialog'
import { KebabMenu } from '@renderer/components/KebabMenu'

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
  const [commentDraft, setCommentDraft] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const { editing, draft, setDraft, start, cancel, save, handleKeyDown, canSave } = useEditable(
    post.body,
    async (next) => {
      await window.api.posts.update(post.id, next)
      onChange()
    },
    post.id
  )

  async function performDelete(): Promise<void> {
    await window.api.posts.delete(post.id)
    setConfirmingDelete(false)
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

  const deletePreview =
    post.body.length > 80 ? post.body.slice(0, 80) + '...' : post.body

  return (
    <aside className="flex w-[42rem] shrink-0 flex-col border-l border-border bg-surface">
      <header className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
        <div className="flex items-center gap-2 text-[11px] text-text-faint">
          {post.comments.length > 0 && (
            <span
              title={`${post.comments.length} ${
                post.comments.length === 1 ? 'comment' : 'comments'
              }`}
              className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-elevated px-1 text-[10px] font-semibold text-text-muted"
            >
              {post.comments.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!editing && (
            <KebabMenu
              items={[
                { label: 'Edit', icon: PencilIcon, onClick: start },
                {
                  label: 'Delete',
                  icon: TrashIcon,
                  onClick: () => setConfirmingDelete(true),
                  destructive: true
                }
              ]}
            />
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
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              spellCheck={false}
              className="w-full resize-none rounded-lg border-none bg-elevated px-3 py-2 text-[15px] leading-relaxed text-text field-sizing-content focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-focus-ring"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[11px] text-text-faint">
                ⌘ + Enter to save · Esc to cancel
              </span>
              <div className="flex gap-2">
                <button
                  onClick={cancel}
                  className="rounded-md px-3 py-1 text-xs font-medium text-text-muted hover:text-text"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={!canSave}
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
              className="w-full resize-none rounded-lg border-none bg-elevated px-3 py-2 text-[14px] leading-relaxed text-text field-sizing-content placeholder:text-text-faint focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-focus-ring"
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

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this entry?"
        message={`"${deletePreview}"\n\nThis cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={performDelete}
        onClose={() => setConfirmingDelete(false)}
      />
    </aside>
  )
}
