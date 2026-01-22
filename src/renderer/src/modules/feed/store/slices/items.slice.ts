import { StateCreator } from 'zustand'
import { FeedState, FeedItem, ItemsSlice } from '../types'
import { ItemFilter, FeedItem as DbFeedItem } from '@/types'
import { useToastStore } from '@/stores/toast.store'
import { invokeIPC } from '@/utils/ipc'
import { parseFeedItem } from '@/utils/transform'


export const createItemsSlice: StateCreator<FeedState, [], [], ItemsSlice> = (set, get) => ({
  items: [],
  selectedItemId: null,
  loading: false,
  recentlyReadIds: new Set(),
  autoHideRead: false,
  isFetching: false,

  initSchedulerListeners: () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (window as any).api
    if (api && api.on) {
        api.on('scheduler:fetch-start', () => {
            set({ isFetching: true })
        })
        api.on('scheduler:fetch-end', () => {
            set({ isFetching: false })
            get().fetchItems()
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

      // Fetch items: silent=true (no toast), logs handled by invokeIPC
      const items = await invokeIPC(window.api.feed.listItems(dbFilter), { silent: true })

      // 轉換 DB 格式到 Store 格式
      const feedItems: FeedItem[] = items.map((i: DbFeedItem) =>
        parseFeedItem(i, get().subscriptions.find((s) => s.id === i.feed_id)?.name)
      )

      set({ items: feedItems })
    } catch {
      // Error handled by invokeIPC
    } finally {
      set({ loading: false })
    }
  },

  selectItem: async (id) => {
    set({ selectedItemId: id })
    if (id) {
      // Fetch highlights for this item
      await get().fetchHighlights(id)

      // 自動標記為已讀
      const item = get().items.find((i) => i.id === id)
      if (item && item.status === 'unread') {
        await get().markAsRead(id)
      }
    }
  },

  markAsRead: async (id) => {
    try {
      // 先取得 item 來獲取 feed_id（用於更新 unreadCount）
      const item = get().items.find((i) => i.id === id)
      if (!item || item.status !== 'unread') return // 已讀或不存在則跳過

      // invokeIPC handles Toast/Log on error.
      await invokeIPC(window.api.feed.markAsRead(id))
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
    } catch {
       // Error handled by invokeIPC
    }
  },

  saveItem: async (id, personalNote) => {
    const item = get().items.find((i) => i.id === id)
    if (!item) return undefined

    try {
      // Don't convert to Markdown here. The backend NoteService handles HTML->Markdown conversion
      // and image downloading. Passing HTML allows the backend to process images correctly.
      let contentToSave = ''
      if (item.content) {
         contentToSave = item.content
      }

      // invokeIPC handles Toast/Log on error.
      const note = await invokeIPC(window.api.note.save({
        title: item.title,
        content: contentToSave, // Pass raw content (HTML or MD) to backend
        sourceUrl: item.id,
        sourceType: 'feed',
        sourceItemId: item.id,
        tags: ['rss'],
        personalNote: personalNote || item.quickNote
      }))

      set((state) => ({
        items: state.items.map((i) => (i.id === id ? { ...i, status: 'saved' } : i))
      }))

      // invokeIPC handles Toast/Log on error.
      await invokeIPC(window.api.feed.markAsSaved(id))

      useToastStore.getState().addToast({
        type: 'success',
        title: 'Item saved',
        description: item.title
      })

      return note.id
    } catch {
      // Error handled by invokeIPC
      return undefined
    }
  },

  unsaveItem: async (id) => {
    try {
      // invokeIPC handles Toast/Log on error.
      await invokeIPC(window.api.feed.markAsUnsaved(id))
      set((state) => ({
        items: state.items.map((i) => (i.id === id ? { ...i, status: 'read' } : i))
      }))
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Item unsaved'
      })
    } catch {
       // Error handled by invokeIPC
    }
  },

  toggleAutoHideRead: () => {
    set((state) => ({ autoHideRead: !state.autoHideRead }))
  },

  saveQuickNote: async (itemId, note) => {
    try {
      // invokeIPC handles Toast/Log on error.
      await invokeIPC(window.api.feed.saveQuickNote(itemId, note))
      set((state) => ({
        items: state.items.map((i) => (i.id === itemId ? { ...i, quickNote: note } : i))
      }))
    } catch {
       // Error handled by invokeIPC
    }
  }
})
