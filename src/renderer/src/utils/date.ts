import { isValid } from 'date-fns'

/**
 * Checks if a date is valid.
 * @param date The date to check (string, number, or Date object).
 * @returns true if valid, false otherwise.
 */
export function isValidDate(date: string | number | Date | null | undefined): boolean {
  if (date === null || date === undefined) return false
  const d = new Date(date)
  return isValid(d)
}

/**
 * Formats a date to a relative time string (e.g., "2 小時前").
 * Returns "未知日期" if the date is invalid.
 */
export function formatRelativeTime(dateStr: string | number | Date | null | undefined): string {
  if (!isValidDate(dateStr)) return '未知日期'

  const date = new Date(dateStr!)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '剛剛'
  if (diffMins < 60) return `${diffMins} 分鐘前`
  if (diffHours < 24) return `${diffHours} 小時前`
  if (diffDays < 7) return `${diffDays} 天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週前`

  // For older dates, show formatted date
  return date.toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Formats a date to an absolute date string using locale settings.
 * Returns "未知日期" if the date is invalid.
 */
export function formatAbsoluteDate(dateStr: string | number | Date | null | undefined): string {
  if (!isValidDate(dateStr)) return '未知日期'
  const date = new Date(dateStr!)
  return date.toLocaleString('zh-TW') // Using zh-TW to match the requirement implicitly
}
