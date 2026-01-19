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
