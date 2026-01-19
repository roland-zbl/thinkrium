import { create } from 'zustand'
import { ItemFilter, FeedItem as DbFeedItem } from '@/types'
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
}

interface FeedState {
  items: FeedItem[]
  subscriptions: Subscription[]
  selectedItemId: string | null
  activeSubscriptionId: string | null // null means 'All'
  filter: 'all' | 'unread' | 'saved'
  loading: boolean
  recentlyReadIds: Set<string>
  autoHideRead: boolean

  // Actions
  fetchSubscriptions: () => Promise<void>
  fetchItems: () => Promise<void>
  addFeed: (url: string, name?: string, category?: string) => Promise<void>
  removeFeed: (id: string) => Promise<void>
  setFilter: (filter: 'all' | 'unread' | 'saved') => void
  selectItem: (id: string | null) => void
  setActiveSubscription: (id: string | null) => void
  markAsRead: (id: string) => Promise<void>
  saveItem: (id: string) => Promise<string | undefined>
  toggleAutoHideRead: () => void
  saveQuickNote: (itemId: string, note: string) => Promise<void>
}

export const useFeedStore = create<FeedState>((set, get) => ({
  items: [],
  subscriptions: [],
  selectedItemId: null,
  activeSubscriptionId: null,
  filter: 'all',
  loading: false,
  recentlyReadIds: new Set(),
  autoHideRead: false,

  fetchSubscriptions: async () => {
    try {
      // Use silent IPC for fetches to avoid spamming toast on initial load failures
      // But log the error.
      const feeds = await invokeIPC(window.api.feed.listFeeds(), { showErrorToast: false })
      // 需要計算未讀數，這裡暫時簡化，後續可以優化 SQL
      const subscriptions = feeds.map((f) => ({
        id: f.id,
        name: f.title || f.url,
        category: f.category || '未分類',
        unreadCount: f.unreadCount || 0,
        url: f.url,
        icon_url: f.icon_url || undefined
      }))
      set({ subscriptions })
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
    const { activeSubscriptionId, filter } = get()
    set({ loading: true })
    try {
      const dbFilter: ItemFilter = {
        limit: 100 // 限制載入數量，避免卡頓
      }
      if (activeSubscriptionId) {
        dbFilter.feedId = activeSubscriptionId
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
          quickNote: i.quick_note // 這裡暫時會報錯，因為 DbFeedItem 還沒更新，稍後會修
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
    set({ activeSubscriptionId: id, selectedItemId: null, recentlyReadIds: new Set() })
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
  }
}))
