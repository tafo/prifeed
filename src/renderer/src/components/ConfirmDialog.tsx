import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onClose
}: ConfirmDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onClose={onClose} transition className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition duration-150 ease-out data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-2xl transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0"
        >
          <DialogTitle className="text-base font-semibold text-text-emphasis">
            {title}
          </DialogTitle>
          {message && (
            <p className="mt-2 text-[13px] leading-relaxed whitespace-pre-wrap text-text-muted">
              {message}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-inner shadow-white/15 transition-colors ${
                destructive ? 'bg-red-500 hover:bg-red-400' : 'bg-accent hover:bg-accent-hover'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
