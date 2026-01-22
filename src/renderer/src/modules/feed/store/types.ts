import { Folder, Highlight, HighlightColor } from '@/types'

export interface FeedItem {
  id: string
  title: string
  source: string
  date: string | null
  status: 'unread' | 'read' | 'saved'
  summary: string
  content: string | null
  feed_id: string
  link: string | null
  thumbnail?: string // First image URL extracted from content
  quickNote?: string
}

export interface Subscription {
  id: string
  name: string
  category: string
  unreadCount: number
  url: string
  icon_url?: string
  folder_id?: string | null
}

export interface ItemsSlice {
  items: FeedItem[]
  selectedItemId: string | null
  loading: boolean
  recentlyReadIds: Set<string>
  autoHideRead: boolean
  isFetching: boolean

  initSchedulerListeners: () => void
  fetchItems: () => Promise<void>
  selectItem: (id: string | null) => void
  markAsRead: (id: string) => Promise<void>
  saveItem: (id: string, note?: string) => Promise<string | undefined>
  unsaveItem: (id: string) => Promise<void>
  toggleAutoHideRead: () => void
  saveQuickNote: (itemId: string, note: string) => Promise<void>
}

export interface SubscriptionsSlice {
  subscriptions: Subscription[]
  activeSubscriptionId: string | null // null means 'All'
  filter: 'all' | 'unread' | 'saved'

  fetchSubscriptions: () => Promise<void>
  addFeed: (url: string, name?: string, category?: string) => Promise<void>
  updateSubscription: (id: string, updates: { title?: string; url?: string; folder_id?: string | null }) => Promise<void>
  removeFeed: (id: string) => Promise<void>
  setFilter: (filter: 'all' | 'unread' | 'saved') => void
  setActiveSubscription: (id: string | null) => void
  importOpml: (filePath: string) => Promise<{ added: number; skipped: number; errors: string[] } | undefined>
  exportOpml: () => Promise<void>
}

export interface FoldersSlice {
  folders: Folder[]
  activeFolderId: string | null

  fetchFolders: () => Promise<void>
  createFolder: (name: string, parentId?: string) => Promise<void>
  renameFolder: (id: string, name: string) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  moveFolder: (id: string, newParentId: string | null) => Promise<void>
  moveFeedToFolder: (feedId: string, folderId: string | null) => Promise<void>
  setActiveFolder: (id: string | null) => void
}

export interface SearchSlice {
  searchQuery: string
  isSearching: boolean
  searchResults: FeedItem[]
  searchScope: 'all' | 'current'

  search: (query: string) => Promise<void>
  clearSearch: () => void
  setSearchScope: (scope: 'all' | 'current') => void
}

export interface HighlightSlice {
  highlights: Map<string, Highlight[]> // itemId -> Highlight[]

  fetchHighlights: (itemId: string) => Promise<void>
  createHighlight: (itemId: string, text: string, start: number, end: number, color: HighlightColor) => Promise<void>
  updateHighlight: (id: string, note?: string, color?: HighlightColor) => Promise<void>
  deleteHighlight: (id: string, itemId: string) => Promise<void>
}

export type FeedState = ItemsSlice & SubscriptionsSlice & FoldersSlice & SearchSlice & HighlightSlice
