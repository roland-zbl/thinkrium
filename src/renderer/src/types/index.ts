export type ProjectStatus = 'active' | 'pending' | 'completed'

export interface Project {
  id: string
  title: string
  status: ProjectStatus
  targetDate: string | null
  materialCount: number
  deliverableCount: number
  notes: string
  created_at?: string
  updated_at?: string
}

export interface DbProject {
  id: string
  title: string
  status: string
  target_date: string | null
  materialCount: number
  deliverableCount: number
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  title: string
  date: string
  type: string
  projects: string[]
  tags: string[]
  content?: string
}

export interface DbNote {
  id: string
  title: string
  content?: string
  created_at?: string
  date?: string
  source_type?: string
  type?: string
  projects?: string[]
  tags?: string | string[]
}

export interface Feed {
  id: string
  type: 'rss' | 'rsshub'
  url: string
  title: string | null
  icon_url: string | null
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
