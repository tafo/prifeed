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

/**
 * React hook for inline editing of a text value.
 *
 * The hook manages an `editing` flag and a `draft` string. It saves on
 * Cmd/Ctrl+Enter and cancels on Escape. It skips the save when the draft is
 * empty or unchanged.
 *
 * Pass `resetKey` to cancel edit mode when the underlying item changes. For
 * example, `ThreadPanel` passes `post.id` so that edit mode cancels when the
 * user picks a different post.
 *
 * @param initial   The current value. Used as the start point of the draft.
 * @param onSave    Runs with the trimmed draft when the user saves.
 * @param resetKey  Optional. Edit mode cancels when this value changes.
 *
 * @example
 * const editor = useEditable(post.body, async (next) => {
 *   await window.api.posts.update(post.id, next)
 *   refresh()
 * }, post.id)
 *
 * if (editor.editing) {
 *   return (
 *     <textarea
 *       value={editor.draft}
 *       onChange={(e) => editor.setDraft(e.target.value)}
 *       onKeyDown={editor.handleKeyDown}
 *     />
 *   )
 * }
 * return <p onClick={editor.start}>{post.body}</p>
 */
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
