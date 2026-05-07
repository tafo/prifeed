/**
 * Time and date helpers used in the renderer.
 *
 * All formatters use the user's locale. Time is in 24-hour format.
 */

export type Filter = 'all' | 'today' | 'week' | 'month'

const DAY_MS = 86400000
const weekdayShortFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
const weekdayLongFmt = new Intl.DateTimeFormat(undefined, { weekday: 'long' })
const monthFmt = new Intl.DateTimeFormat(undefined, { month: 'short' })

/**
 * Format a timestamp as a 24-hour clock time.
 *
 * @example
 * formatClock(Date.now()) // '14:23'
 */
export function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Format a timestamp for inline display.
 *
 * Show the time alone when the timestamp is from today. Show date and time
 * otherwise. Show the year only when it is not the current year.
 *
 * @example
 * formatTime(today)        // '14:23'
 * formatTime(yesterday)    // 'May 6, 14:23'
 * formatTime(twoYearsAgo)  // 'Jun 1, 2024, 09:15'
 */
export function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  if (sameDay) return formatClock(ts)
  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Return a label for the day of a timestamp.
 *
 * Returns `Today`, `Yesterday`, a weekday name when the timestamp is within
 * the last 7 days, or a full date for older items.
 *
 * @example
 * getDayLabel(today)         // 'Today'
 * getDayLabel(threeDaysAgo)  // 'Tuesday'
 * getDayLabel(lastMonth)     // '5 April 2026'
 */
export function getDayLabel(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const dStart = new Date(d)
  dStart.setHours(0, 0, 0, 0)

  if (dStart.getTime() === today.getTime()) return 'Today'
  if (dStart.getTime() === yesterday.getTime()) return 'Yesterday'

  const dayDiff = Math.round((today.getTime() - dStart.getTime()) / DAY_MS)
  if (dayDiff > 0 && dayDiff < 7) return weekdayLongFmt.format(d)

  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Group items by day label.
 *
 * Sort items in display order before you call this (typically newest first).
 * Groups follow input order.
 *
 * @example
 * const groups = groupByDay(posts)
 * // [{ label: 'Today', items: [...] }, { label: 'Yesterday', items: [...] }]
 */
export function groupByDay<T extends { created_at: number }>(
  items: T[]
): { label: string; items: T[] }[] {
  const groups: { label: string; items: T[] }[] = []
  let current: { label: string; items: T[] } | null = null
  for (const item of items) {
    const label = getDayLabel(item.created_at)
    if (!current || current.label !== label) {
      current = { label, items: [item] }
      groups.push(current)
    } else {
      current.items.push(item)
    }
  }
  return groups
}

/**
 * Return the cutoff timestamp for a filter.
 *
 * Items with `created_at >= cutoff` pass the filter.
 *
 * - `all`: no cutoff (returns -Infinity)
 * - `today`: start of today
 * - `week`: 7 days back from start of today
 * - `month`: start of the current month
 */
export function getFilterCutoff(filter: Filter): number {
  if (filter === 'all') return -Infinity
  const now = new Date()
  if (filter === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  }
  if (filter === 'week') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return today.getTime() - 6 * DAY_MS
  }
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime()
}

export { weekdayShortFmt, monthFmt }
