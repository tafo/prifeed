import { useEffect, useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, Textarea } from '@headlessui/react'

interface ComposeModalProps {
  open: boolean
  onClose: () => void
  onPosted: () => void
}

export function ComposeModal({
  open,
  onClose,
  onPosted
}: ComposeModalProps): React.JSX.Element {
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setDraft('')
      setSubmitting(false)
    }
  }, [open])

  async function submit(): Promise<void> {
    const body = draft.trim()
    if (!body) return
    setSubmitting(true)
    try {
      await window.api.posts.create(body)
      onPosted()
      onClose()
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
    <Dialog open={open} onClose={onClose} transition className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition duration-150 ease-out data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex items-start justify-center p-4 pt-24">
        <DialogPanel
          transition
          className="w-full max-w-2xl rounded-xl border border-border bg-surface p-5 shadow-2xl transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0"
        >
          <Textarea
            autoFocus
            aria-label="New entry"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            rows={6}
            spellCheck={false}
            className="w-full resize-none rounded-lg border-none bg-elevated px-3 py-2 text-[15px] leading-relaxed text-text placeholder:text-text-faint focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-focus-ring"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-[11px] text-text-faint">
              ⌘ + Enter to post · Esc to cancel
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-md px-3 py-1 text-xs font-medium text-text-muted hover:text-text"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting || !draft.trim()}
                className="rounded-md bg-accent px-3 py-1 text-xs font-semibold text-white shadow-inner shadow-white/15 transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-30"
              >
                Post
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
