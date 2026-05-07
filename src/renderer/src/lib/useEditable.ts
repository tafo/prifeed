import { useEffect, useState } from 'react'

interface UseEditableResult {
  editing: boolean
  draft: string
  setDraft: (v: string) => void
  start: () => void
  cancel: () => void
  save: () => Promise<void>
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  canSave: boolean
}

export function useEditable(
  initial: string,
  onSave: (next: string) => Promise<void> | void,
  resetKey?: string | number
): UseEditableResult {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (resetKey === undefined) return
    setEditing(false)
    setDraft('')
  }, [resetKey])

  function start(): void {
    setEditing(true)
    setDraft(initial)
  }

  function cancel(): void {
    setEditing(false)
    setDraft('')
  }

  async function save(): Promise<void> {
    const trimmed = draft.trim()
    if (!trimmed || trimmed === initial) {
      cancel()
      return
    }
    await onSave(trimmed)
    cancel()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      save()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
    }
  }

  const canSave = draft.trim().length > 0 && draft.trim() !== initial

  return { editing, draft, setDraft, start, cancel, save, handleKeyDown, canSave }
}
