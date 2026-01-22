import { StateCreator } from 'zustand'
import { FeedState, FeedItem, SearchSlice } from '../types'
import { SearchOptions, SearchResult } from '@/types'
import { useToastStore } from '@/stores/toast.store'
import { invokeIPC } from '@/utils/ipc'
import { parseFeedItem } from '@/utils/transform'

export const createSearchSlice: StateCreator<FeedState, [], [], SearchSlice> = (set, get) => ({
  searchQuery: '',
  isSearching: false,
  searchResults: [],
  searchScope: 'all',

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

      const feedItems: FeedItem[] = results.map((i: SearchResult) =>
        parseFeedItem(i, get().subscriptions.find((s) => s.id === i.feed_id)?.name)
      )

      set({ searchResults: feedItems })
    } catch (error) {
      console.error('Search failed:', error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Search failed',
        description: msg
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
})
