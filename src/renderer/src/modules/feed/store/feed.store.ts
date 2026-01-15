import { create } from 'zustand'
import { ItemFilter, FeedItem as DbFeedItem } from '@/types'
import { turndown } from '@/lib/turndown'
import { useToastStore } from '@/stores/toast.store'


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
}

export const useFeedStore = create<FeedState>((set, get) => ({
  items: [],
  subscriptions: [],
  selectedItemId: null,
  activeSubscriptionId: null,
  filter: 'all',
  loading: false,

  fetchSubscriptions: async () => {
    try {
      const feeds = await window.api.feed.listFeeds()
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
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to fetch subscriptions',
        description: msg
      })
      console.error('Failed to fetch subscriptions:', error)
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

      const items = await window.api.feed.listItems(dbFilter)

      // 轉換 DB 格式到 Store 格式
      const feedItems: FeedItem[] = items.map((i: DbFeedItem) => ({
        id: i.id,
        title: i.title,
        source: get().subscriptions.find((s) => s.id === i.feed_id)?.name || 'Unknown',
        date: i.published_at,
        status: i.status,
        summary: i.content ? i.content.substring(0, 100) : '',
        content: i.content,
        feed_id: i.feed_id,
        link: i.url
      }))

      set({ items: feedItems })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to fetch items',
        description: msg
      })
      console.error('Failed to fetch items:', error)
    } finally {
      set({ loading: false })
    }
  },

  addFeed: async (url, name, category) => {
    try {
      set({ loading: true })
      // 1. 驗證
      const validation = await window.api.feed.validateFeed(url)
      if (!validation.valid) {
        throw new Error(validation.error || '無效的 RSS 源')
      }

      // 2. 新增
      const id = crypto.randomUUID()
      await window.api.feed.addFeed({
        id,
        url,
        title: name || validation.title || url,
        type: 'rss',
        icon_url: validation.icon || null,
        category: category || '未分類',
        last_fetched: null,
        fetch_interval: 30
      })

      // 3. 立即抓取
      await window.api.feed.fetchFeed(id)

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
      await window.api.feed.removeFeed(id)
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
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to remove feed',
        description: msg
      })
      console.error('Failed to remove feed:', error)
    }
  },

  setFilter: (filter) => {
    set({ filter })
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
    set({ activeSubscriptionId: id, selectedItemId: null })
    get().fetchItems()
  },

  markAsRead: async (id) => {
    try {
      await window.api.feed.markAsRead(id)
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? { ...item, status: 'read' } : item))
      }))
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to mark as read',
        description: msg
      })
      console.error('Failed to mark as read:', error)
    }
  },

  saveItem: async (id) => {
    const item = get().items.find((i) => i.id === id)
    if (!item) return undefined

    try {
      // Convert HTML to Markdown
      const markdown = item.content ? turndown.turndown(item.content) : ''

      const note = await window.api.note.save({
        title: item.title,
        content: markdown, // Save as Markdown
        sourceUrl: item.id,
        sourceType: 'rss',
        sourceItemId: item.id,
        tags: ['rss']
      })

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
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to save item',
        description: msg
      })
      console.error('Failed to save item:', error)
      return undefined
    }
  }
}))
