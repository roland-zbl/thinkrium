import { format } from 'date-fns'
import { Note, DbNote, FeedItem as DbFeedItem, SearchResult } from '@/types'
import { FeedItem } from '@/modules/feed/store/types'
import { stripHtml, extractFirstImage } from '@/modules/feed/store/utils'

/**
 * Parse tags from DB format (JSON string or array) to string array
 */
export function parseTags(tags: string | string[] | null | undefined): string[] {
  if (!tags) return []

  if (Array.isArray(tags)) {
    return tags
  }

  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  return []
}

/**
 * Format date to yyyy-MM-dd
 * Handles null, undefined, invalid dates by defaulting to today
 */
export function formatNoteDate(date: string | number | Date | null | undefined): string {
  try {
    if (!date) return format(new Date(), 'yyyy-MM-dd')
    return format(new Date(date), 'yyyy-MM-dd')
  } catch {
    return format(new Date(), 'yyyy-MM-dd')
  }
}

/**
 * Parse DbNote to application Note model
 */
export function parseDbNote(n: DbNote): Note {
  // Handle quick_note extraction
  const quick_note = (() => {
    if (!n.content) return undefined
    const match = n.content.match(/^quick_note:\s*"([^"]+)"/m)
    return match ? match[1] : undefined
  })()

  return {
    id: n.id,
    title: n.title,
    date: formatNoteDate(n.created_at || n.date),
    type: n.source_type || n.type || 'note',
    projects: n.projects || [],
    tags: parseTags(n.tags),
    content: n.content,
    quick_note
  }
}

/**
 * Parse DbFeedItem or SearchResult to application FeedItem model
 */
export function parseFeedItem(
  i: DbFeedItem | SearchResult,
  sourceName: string = 'Unknown'
): FeedItem {
  // Determine summary/snippet
  let displaySummary = ''

  // Check if it's a SearchResult and has snippets
  if ('content_snippet' in i && i.content_snippet) {
    displaySummary = i.content_snippet
  } else if ('content_snippet' in i && !i.content_snippet && i.content) {
     // Fallback for search result without snippet
     displaySummary = stripHtml(i.content).substring(0, 150)
  } else if (i.content) {
    // Regular Feed Item
    displaySummary = stripHtml(i.content).substring(0, 150)
  }

  // Determine title
  const displayTitle = ('title_snippet' in i && i.title_snippet)
    ? i.title_snippet
    : i.title

  const thumbnail = extractFirstImage(i.content || '')

  return {
    id: i.id,
    title: displayTitle,
    source: sourceName,
    date: i.published_at, // Keep original format per requirements
    status: i.status as any, // Cast to match FeedItem status union type
    summary: displaySummary,
    content: i.content,
    feed_id: i.feed_id,
    link: i.url,
    thumbnail,
    quickNote: i.quick_note
  }
}
