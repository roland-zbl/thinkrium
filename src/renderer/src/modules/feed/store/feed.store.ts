import { create } from 'zustand'
import { ItemFilter, FeedItem as DbFeedItem, Folder, SearchOptions, SearchResult } from '@/types'
import { turndown } from '@/lib/turndown'
import { useToastStore } from '@/stores/toast.store'
import { invokeIPC } from '@/utils/ipc'


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

// Helper: Strip HTML tags and decode entities for clean text summary
function stripHtml(html: string): string {
  if (!html) return ''
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '')
  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '…')
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim()
  return text
}

// Helper: Extract first image URL from HTML content
function extractFirstImage(html: string): string | undefined {
  if (!html) return undefined
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match?.[1]
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

interface FeedState {
  items: FeedItem[]
  subscriptions: Subscription[]
  folders: Folder[]
  selectedItemId: string | null
  activeSubscriptionId: string | null // null means 'All'
  activeFolderId: string | null
  filter: 'all' | 'unread' | 'saved'
  loading: boolean
  recentlyReadIds: Set<string>
  autoHideRead: boolean

  // Search State
  searchQuery: string
  isSearching: boolean
  searchResults: FeedItem[]
  searchScope: 'all' | 'current'

  // Actions
  fetchSubscriptions: () => Promise<void>
  fetchFolders: () => Promise<void>
  fetchItems: () => Promise<void>
  addFeed: (url: string, name?: string, category?: string) => Promise<void>
  removeFeed: (id: string) => Promise<void>
  setFilter: (filter: 'all' | 'unread' | 'saved') => void
  selectItem: (id: string | null) => void
  setActiveSubscription: (id: string | null) => void
  setActiveFolder: (id: string | null) => void
  markAsRead: (id: string) => Promise<void>
  saveItem: (id: string) => Promise<string | undefined>
  toggleAutoHideRead: () => void
  saveQuickNote: (itemId: string, note: string) => Promise<void>
  importOpml: (filePath: string) => Promise<{ added: number; skipped: number; errors: string[] } | undefined>
  exportOpml: () => Promise<void>

  // Search Actions
  search: (query: string) => Promise<void>
  clearSearch: () => void
  setSearchScope: (scope: 'all' | 'current') => void

  // Folder Actions
  createFolder: (name: string, parentId?: string) => Promise<void>
  renameFolder: (id: string, name: string) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  moveFolder: (id: string, newParentId: string | null) => Promise<void>
  moveFeedToFolder: (feedId: string, folderId: string | null) => Promise<void>
}

export const useFeedStore = create<FeedState>((set, get) => ({
  items: [],
  subscriptions: [],
  folders: [],
  selectedItemId: null,
  activeSubscriptionId: null,
  activeFolderId: null,
  filter: 'all',
  loading: false,
  recentlyReadIds: new Set(),
  autoHideRead: false,

  searchQuery: '',
  isSearching: false,
  searchResults: [],
  searchScope: 'all',

  fetchFolders: async () => {
    try {
      const folders = await invokeIPC(window.api.folder.list(), { showErrorToast: false })
      set({ folders })
    } catch (error) {
      console.error('Failed to fetch folders:', error)
    }
  },

  fetchSubscriptions: async () => {
    try {
      // Use silent IPC for fetches to avoid spamming toast on initial load failures
      // But log the error.
      const feeds = await invokeIPC(window.api.feed.listFeeds(), { showErrorToast: false })
      const folders = await invokeIPC(window.api.folder.list(), { showErrorToast: false })

      // 需要計算未讀數，這裡暫時簡化，後續可以優化 SQL
      const subscriptions = feeds.map((f) => ({
        id: f.id,
        name: f.title || f.url,
        category: f.category || '未分類',
        unreadCount: f.unreadCount || 0,
        url: f.url,
        icon_url: f.icon_url || undefined,
        folder_id: f.folder_id
      }))
      set({ subscriptions, folders })
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
      const msg = error instanceof Error ? error.message : String(error)
      // Only toast if it's not a common network glitch? Or always?
      // User asked for friendly messages.
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to refresh feeds',
        description: msg
      })
    }
  },

  fetchItems: async () => {
    const { activeSubscriptionId, activeFolderId, filter, subscriptions, folders } = get()
    set({ loading: true })
    try {
      const dbFilter: ItemFilter = {
        limit: 100 // 限制載入數量，避免卡頓
      }

      if (activeSubscriptionId) {
        dbFilter.feedId = activeSubscriptionId
      } else if (activeFolderId) {
         // Collect all feed IDs in this folder and subfolders
        const getFolderFeedIds = (folderId: string): string[] => {
          const feedIds = subscriptions
            .filter((s) => s.folder_id === folderId)
            .map((s) => s.id)
          const subFolderIds = folders
            .filter((f) => f.parent_id === folderId)
            .map((f) => f.id)

          let allFeedIds = [...feedIds]
          for (const subId of subFolderIds) {
            allFeedIds = [...allFeedIds, ...getFolderFeedIds(subId)]
          }
          return allFeedIds
        }

        const targetFeedIds = getFolderFeedIds(activeFolderId)
        if (targetFeedIds.length > 0) {
            dbFilter.feedIds = targetFeedIds
        } else {
            // Folder is empty, return empty list immediately
            set({ items: [], loading: false })
            return
        }
      }

      if (filter === 'unread') {
        dbFilter.status = 'unread'
      } else if (filter === 'saved') {
        dbFilter.status = 'saved'
      }

      const items = await invokeIPC(window.api.feed.listItems(dbFilter), { showErrorToast: false })

      // 轉換 DB 格式到 Store 格式
      const feedItems: FeedItem[] = items.map((i: DbFeedItem) => {
        const cleanSummary = stripHtml(i.content || '').substring(0, 150)
        const thumbnail = extractFirstImage(i.content || '')
        return {
          id: i.id,
          title: i.title,
          source: get().subscriptions.find((s) => s.id === i.feed_id)?.name || 'Unknown',
          date: i.published_at,
          status: i.status,
          summary: cleanSummary,
          content: i.content,
          feed_id: i.feed_id,
          link: i.url,
          thumbnail,
          quickNote: i.quick_note
        }
      })

      set({ items: feedItems })
    } catch (error) {
      console.error('Failed to fetch items:', error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to load items',
        description: msg
      })
    } finally {
      set({ loading: false })
    }
  },

  addFeed: async (url, name, category) => {
    try {
      set({ loading: true })
      // 1. 驗證 (silent IPC, handle toast manually)
      const validation = await invokeIPC(window.api.feed.validateFeed(url), { showErrorToast: false })
      if (!validation.valid) {
        throw new Error(validation.error || '無效的 RSS 源')
      }

      // 2. 新增
      const id = crypto.randomUUID()
      // Fix: validation.icon property access
      const iconUrl = 'icon' in validation ? (validation as any).icon : null

      await invokeIPC(window.api.feed.addFeed({
        id,
        url,
        title: name || validation.title || url,
        type: 'rss',
        icon_url: iconUrl,
        category: category || '未分類',
        last_fetched: null,
        fetch_interval: 30
      }), { showErrorToast: false })

      // 3. 立即抓取
      await invokeIPC(window.api.feed.fetchFeed(id), { showErrorToast: false })

      // 4. 更新列表
      await get().fetchSubscriptions()
      await get().fetchItems()
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Feed added',
        description: name || validation.title || url
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to add feed',
        description: msg
      })
      console.error('Failed to add feed:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  removeFeed: async (id) => {
    try {
      await invokeIPC(window.api.feed.removeFeed(id), { showErrorToast: false })
      set((state) => ({
        subscriptions: state.subscriptions.filter((s) => s.id !== id),
        items: state.items.filter((i) => i.feed_id !== id),
        activeSubscriptionId: state.activeSubscriptionId === id ? null : state.activeSubscriptionId
      }))
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Feed removed'
      })
    } catch (error) {
      console.error('Failed to remove feed:', error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to remove feed',
        description: msg
      })
    }
  },

  setFilter: (filter) => {
    set({ filter, recentlyReadIds: new Set() })
    get().fetchItems()
  },

  selectItem: async (id) => {
    set({ selectedItemId: id })
    if (id) {
      // 自動標記為已讀
      const item = get().items.find((i) => i.id === id)
      if (item && item.status === 'unread') {
        await get().markAsRead(id)
      }
    }
  },

  setActiveSubscription: (id) => {
    set({
      activeSubscriptionId: id,
      activeFolderId: null,
      selectedItemId: null,
      recentlyReadIds: new Set()
    })
    get().fetchItems()
  },

  setActiveFolder: (id) => {
    set({
      activeFolderId: id,
      activeSubscriptionId: null,
      selectedItemId: null,
      recentlyReadIds: new Set()
    })
    get().fetchItems()
  },

  markAsRead: async (id) => {
    try {
      // 先取得 item 來獲取 feed_id（用於更新 unreadCount）
      const item = get().items.find((i) => i.id === id)
      if (!item || item.status !== 'unread') return // 已讀或不存在則跳過

      await invokeIPC(window.api.feed.markAsRead(id), { showErrorToast: false })
      set((state) => {
        const recentlyReadIds = new Set(state.recentlyReadIds)
        if (!state.autoHideRead) {
          recentlyReadIds.add(id)
        }
        return {
          recentlyReadIds,
          items: state.items.map((i) => (i.id === id ? { ...i, status: 'read' } : i)),
          // 同時更新對應訂閱源的未讀數
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === item.feed_id && sub.unreadCount > 0
              ? { ...sub, unreadCount: sub.unreadCount - 1 }
              : sub
          )
        }
      })
    } catch (error) {
      console.error('Failed to mark as read:', error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to mark as read',
        description: msg
      })
    }
  },

  saveItem: async (id) => {
    const item = get().items.find((i) => i.id === id)
    if (!item) return undefined

    try {
      // Convert HTML to Markdown
      const markdown = item.content ? turndown.turndown(item.content) : ''

      const note = await invokeIPC(window.api.note.save({
        title: item.title,
        content: markdown, // Save as Markdown
        sourceUrl: item.id,
        sourceType: 'rss',
        sourceItemId: item.id,
        tags: ['rss']
      }), { showErrorToast: false })

      set((state) => ({
        items: state.items.map((i) => (i.id === id ? { ...i, status: 'saved' } : i))
      }))

      useToastStore.getState().addToast({
        type: 'success',
        title: 'Item saved',
        description: item.title
      })

      return note.id
    } catch (error) {
      console.error('Failed to save item:', error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to save item',
        description: msg
      })
      return undefined
    }
  },

  toggleAutoHideRead: () => {
    set((state) => ({ autoHideRead: !state.autoHideRead }))
  },

  saveQuickNote: async (itemId, note) => {
    try {
      await invokeIPC(window.api.feed.saveQuickNote(itemId, note), { showErrorToast: false })
      set((state) => ({
        items: state.items.map((i) => (i.id === itemId ? { ...i, quickNote: note } : i))
      }))
    } catch (error) {
      console.error('Failed to save quick note:', error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to save quick note',
        description: msg
      })
    }
  },

  importOpml: async (filePath) => {
    set({ loading: true })
    try {
      const result = await invokeIPC(window.api.feed.importOpml(filePath), {
        showErrorToast: false
      })
      if (result.added > 0) {
        useToastStore.getState().addToast({
          type: 'success',
          title: 'OPML Import Completed',
          description: `Added ${result.added} feeds, skipped ${result.skipped}`
        })
        await get().fetchSubscriptions()
        await get().fetchItems()
      } else if (result.errors.length > 0) {
        useToastStore.getState().addToast({
          type: 'error',
          title: 'OPML Import Finished with Errors',
          description: `Failed to import ${result.errors.length} feeds`
        })
      } else {
        useToastStore.getState().addToast({
          type: 'info',
          title: 'No new feeds added',
          description: `Skipped ${result.skipped} duplicates`
        })
      }
      return result
    } catch (error) {
      console.error('Failed to import OPML:', error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to import OPML',
        description: msg
      })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  exportOpml: async () => {
    try {
      const success = await invokeIPC(window.api.feed.exportOpml(), { showErrorToast: false })
      if (success) {
        useToastStore.getState().addToast({
          type: 'success',
          title: 'OPML Exported Successfully'
        })
      }
    } catch (error) {
      console.error('Failed to export OPML:', error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to export OPML',
        description: msg
      })
    }
  },

  // Folder Actions
  createFolder: async (name, parentId) => {
    try {
      await invokeIPC(window.api.folder.create(name, parentId))
      await get().fetchFolders()
      useToastStore.getState().addToast({ type: 'success', title: 'Folder created' })
    } catch (error) {
      console.error(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to create folder' })
    }
  },
  renameFolder: async (id, name) => {
    try {
      await invokeIPC(window.api.folder.rename(id, name))
      await get().fetchFolders()
      useToastStore.getState().addToast({ type: 'success', title: 'Folder renamed' })
    } catch (error) {
      console.error(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to rename folder' })
    }
  },
  deleteFolder: async (id) => {
    try {
      await invokeIPC(window.api.folder.delete(id))
      await get().fetchFolders()
      await get().fetchSubscriptions() // Feeds are moved to root
      useToastStore.getState().addToast({ type: 'success', title: 'Folder deleted' })
    } catch (error) {
      console.error(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to delete folder' })
    }
  },
  moveFolder: async (id, newParentId) => {
    try {
      await invokeIPC(window.api.folder.move(id, newParentId))
      await get().fetchFolders()
    } catch (error) {
      console.error(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to move folder' })
    }
  },
  moveFeedToFolder: async (feedId, folderId) => {
    try {
      await invokeIPC(window.api.feed.moveFeedToFolder(feedId, folderId))
      await get().fetchSubscriptions()
    } catch (error) {
      console.error(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to move feed' })
    }
  },

  search: async (query) => {
    set({ searchQuery: query })
    if (!query.trim()) {
      set({ isSearching: false, searchResults: [] })
      return
    }

    set({ isSearching: true, loading: true })
    const { activeSubscriptionId, activeFolderId, searchScope, subscriptions, folders } = get()

    try {
      const options: SearchOptions = {
        limit: 100
      }

      if (searchScope === 'current') {
        if (activeSubscriptionId) {
          options.feedId = activeSubscriptionId
        } else if (activeFolderId) {
          // Helper to recursively get feed IDs (duplicated from fetchItems, consider refactoring)
          const getFolderFeedIds = (folderId: string): string[] => {
            const feedIds = subscriptions
              .filter((s) => s.folder_id === folderId)
              .map((s) => s.id)
            const subFolderIds = folders
              .filter((f) => f.parent_id === folderId)
              .map((f) => f.id)

            let allFeedIds = [...feedIds]
            for (const subId of subFolderIds) {
              allFeedIds = [...allFeedIds, ...getFolderFeedIds(subId)]
            }
            return allFeedIds
          }
          const ids = getFolderFeedIds(activeFolderId)
          if (ids.length > 0) options.feedIds = ids
        }
      }

      const results = (await invokeIPC(window.api.feed.search(query, options), {
        showErrorToast: false
      })) as SearchResult[]

      const feedItems: FeedItem[] = results.map((i: SearchResult) => {
        const thumbnail = extractFirstImage(i.content || '')

        // Use content_snippet for summary if available, otherwise title_snippet, otherwise fallback to content/title
        // We trust the backend snippet to contain safe HTML (only <b> tags added by sqlite or us)
        // Ideally we should sanitize but for now we assume trust.
        let displaySummary = i.content_snippet
        if (!displaySummary && i.content) {
             displaySummary = stripHtml(i.content).substring(0, 150)
        }

        // Use title_snippet if available
        const displayTitle = i.title_snippet || i.title

        return {
          id: i.id,
          title: displayTitle,
          source: get().subscriptions.find((s) => s.id === i.feed_id)?.name || 'Unknown',
          date: i.published_at,
          status: i.status,
          summary: displaySummary || '',
          content: i.content,
          feed_id: i.feed_id,
          link: i.url,
          thumbnail,
          quickNote: i.quick_note
        }
      })

      set({ searchResults: feedItems })
    } catch (error) {
      console.error('Search failed:', error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Search failed',
        description: error instanceof Error ? error.message : String(error)
      })
    } finally {
      set({ loading: false })
    }
  },

  clearSearch: () => {
    set({ searchQuery: '', isSearching: false, searchResults: [] })
  },

  setSearchScope: (scope) => {
    set({ searchScope: scope })
    // Re-trigger search if there is a query
    const { searchQuery } = get()
    if (searchQuery) {
      get().search(searchQuery)
    }
  }
}))
