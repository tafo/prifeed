import { useState } from 'react'
import { Textarea } from '@headlessui/react'
import { PencilIcon, TrashIcon } from '@heroicons/react/16/solid'
import type { Comment } from '@renderer/types'
import { formatTime } from '@renderer/lib/time'
import { useEditable } from '@renderer/lib/useEditable'
import { KebabMenu } from '@renderer/components/KebabMenu'
import { ConfirmDialog } from '@renderer/components/ConfirmDialog'

interface CommentItemProps {
  comment: Comment
  onChange: () => void
}

export function CommentItem({ comment, onChange }: CommentItemProps): React.JSX.Element {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const { editing, draft, setDraft, start, cancel, save, handleKeyDown, canSave } = useEditable(
    comment.body,
    async (next) => {
      await window.api.comments.update(comment.id, next)
      onChange()
    }
  )

  async function performDelete(): Promise<void> {
    await window.api.comments.delete(comment.id)
    setConfirmingDelete(false)
    onChange()
  }

  if (editing) {
    return (
      <div>
        <Textarea
          autoFocus
          aria-label="Edit comment body"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          spellCheck={false}
          className="w-full resize-none rounded-2xl border-none bg-surface px-3.5 py-2 text-[14px] leading-snug text-text field-sizing-content focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-focus-ring"
        />
        <div className="mt-1 ml-3.5 flex items-center justify-between text-[11px] text-text-faint">
          <span className="font-mono">⌘ + Enter · Esc</span>
          <div className="flex items-center gap-2">
            <button onClick={cancel} className="text-text-muted hover:text-text">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!canSave}
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
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this comment?"
        message="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={performDelete}
        onClose={() => setConfirmingDelete(false)}
      />
    </div>
  )
}
