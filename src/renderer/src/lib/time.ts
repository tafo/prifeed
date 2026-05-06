export type Filter = 'all' | 'today' | 'week' | 'month'

export function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }
  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getFilterCutoff(filter: Filter): number {
  if (filter === 'all') return -Infinity
  const now = new Date()
  if (filter === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  }
  if (filter === 'week') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return today.getTime() - 6 * 24 * 60 * 60 * 1000
  }
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime()
}
