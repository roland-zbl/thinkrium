export interface Feed {
  id: string
  type: 'rss' | 'rsshub'
  url: string
  title: string | null
  icon_url: string | null
  category?: string
  last_fetched: string | null
  fetch_interval: number
  created_at: string
  unreadCount?: number
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
}

export interface ItemFilter {
  feedId?: string
  status?: 'unread' | 'read' | 'saved'
  limit?: number
  offset?: number
}
