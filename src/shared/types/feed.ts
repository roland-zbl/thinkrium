export interface Feed {
  id: string
  type: 'rss' | 'rsshub'
  url: string
  title: string | null
  icon_url: string | null
  category?: string
  folder_id?: string | null
  last_fetched: string | null
  fetch_interval: number
  created_at: string
  unreadCount?: number
}

export interface Folder {
  id: string
  name: string
  parent_id: string | null
  position: number
  created_at: string
}

export interface FeedItem {
  id: string
  feed_id: string
  guid: string
  title: string
  url: string | null
  content: string | null
  author: string | null
  published_at: string | null
  fetched_at: string
  status: 'unread' | 'read' | 'saved'
  read_at: string | null
  quick_note?: string
}

export interface ItemFilter {
  feedId?: string
  feedIds?: string[] // Support multiple feeds
  status?: 'unread' | 'read' | 'saved'
  limit?: number
  offset?: number
}

export interface SearchOptions {
  feedId?: string
  folderId?: string // This will need to be resolved to feedIds in the backend or frontend
  feedIds?: string[]
  limit?: number
  offset?: number
}

export interface SearchResult extends FeedItem {
  title_snippet?: string
  content_snippet?: string
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink'

export interface Highlight {
  id: string
  feed_item_id: string
  text: string
  note: string | null
  color: HighlightColor
  start_offset: number
  end_offset: number
  created_at: string
}

export interface CreateHighlightDTO {
  id: string
  feed_item_id: string
  text: string
  note?: string
  color: HighlightColor
  start_offset: number
  end_offset: number
}

export interface UpdateHighlightDTO {
  id: string
  note?: string
  color?: HighlightColor
}

export interface UpdateFeedDTO {
  title?: string
  url?: string
  folder_id?: string | null
}
