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
      const feeds = await invokeIPC(window.api.feed.listFeeds(), { silent: true })
      const folders = await invokeIPC(window.api.folder.list(), { silent: true })

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
    } catch {
       // Error handled by invokeIPC
    }
  },

  addFeed: async (url, name, category) => {
    try {
      set({ loading: true })
      // 1. Validation
      // Use silent: false because validation failure (IPC error) IS a user operation failure.
      // If validation returns { success: true, valid: false }, invokeIPC doesn't throw, we handle it.
      // If validation returns { success: false }, invokeIPC throws and Toasts.
      const validation = await invokeIPC(window.api.feed.validateFeed(url))

      if (!validation.valid) {
        // Logic error (valid RSS but rejected by parser, or not RSS)
        throw new Error(validation.error || '無效的 RSS 源')
      }

      // 2. Add Feed
      const id = crypto.randomUUID()
      // Fix: validation.icon property access
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const iconUrl = 'icon' in validation ? (validation as any).icon : null

      // invokeIPC handles Toast/Log on error
      await invokeIPC(window.api.feed.addFeed({
        id,
        url,
        title: name || validation.title || url,
        type: 'rss',
        icon_url: iconUrl,
        category: category || '未分類',
        last_fetched: null,
        fetch_interval: 30
      }))

      // 3. Fetch immediately
      // invokeIPC handles Toast/Log on error
      await invokeIPC(window.api.feed.fetchFeed(id))

      // 4. Update lists
      await get().fetchSubscriptions()
      await get().fetchItems()
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Feed added',
        description: name || validation.title || url
      })
    } catch (error) {
      // Logic errors (thrown manually above) need to be toasted.
      // AppErrors (thrown by invokeIPC) are already toasted/logged.

      // Check if it's AppError by name property (since we can't easily instanceof without importing class)
      if ((error as any).name !== 'AppError') {
         const msg = error instanceof Error ? error.message : String(error)
         useToastStore.getState().addToast({
            type: 'error',
            title: 'Failed to add feed',
            description: msg
         })
         // Log manual errors
         console.error('Failed to add feed:', error)
      }

      throw error
    } finally {
      set({ loading: false })
    }
  },

  removeFeed: async (id) => {
    try {
      await invokeIPC(window.api.feed.removeFeed(id))
      set((state) => ({
        subscriptions: state.subscriptions.filter((s) => s.id !== id),
        items: state.items.filter((i) => i.feed_id !== id),
        activeSubscriptionId: state.activeSubscriptionId === id ? null : state.activeSubscriptionId
      }))
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Feed removed'
      })
    } catch {
       // Error handled by invokeIPC
    }
  },

  updateSubscription: async (id, updates) => {
    try {
      await invokeIPC(window.api.feed.updateFeed(id, updates))
      await get().fetchSubscriptions()
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Feed updated'
      })
    } catch (error) {
      // invokeIPC handled toast/log
      throw error // Re-throw if needed by caller
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
      const result = await invokeIPC(window.api.feed.importOpml(filePath))

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
      // invokeIPC handled logs/toasts.
      throw error
    } finally {
      set({ loading: false })
    }
  },

  exportOpml: async () => {
    try {
      const success = await invokeIPC(window.api.feed.exportOpml())
      if (success) {
        useToastStore.getState().addToast({
          type: 'success',
          title: 'OPML Exported Successfully'
        })
      }
    } catch {
       // Error handled by invokeIPC
    }
  }
})
