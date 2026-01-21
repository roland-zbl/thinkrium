import { StateCreator } from 'zustand'
import { FeedState, SubscriptionsSlice } from '../types'
import { useToastStore } from '@/stores/toast.store'
import { invokeIPC } from '@/utils/ipc'

export const createSubscriptionsSlice: StateCreator<FeedState, [], [], SubscriptionsSlice> = (set, get) => ({
  subscriptions: [],
  activeSubscriptionId: null,
  filter: 'all',

  fetchSubscriptions: async () => {
    try {
      // Use silent IPC for fetches to avoid spamming toast on initial load failures
      // But log the error.
      const feeds = await invokeIPC(window.api.feed.listFeeds(), { showErrorToast: false })
      const folders = await invokeIPC(window.api.folder.list(), { showErrorToast: false })

      console.log('[Store] Fetched feeds:', feeds)
      console.log('[Store] Fetched folders:', folders)

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
      // Silent error for fetch
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  setActiveSubscription: (id) => {
    set({
      activeSubscriptionId: id,
      activeFolderId: null,
      selectedItemId: null,
      recentlyReadIds: new Set()
    })
    get().fetchItems()
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
  }
})
