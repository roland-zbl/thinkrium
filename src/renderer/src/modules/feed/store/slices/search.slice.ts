import { StateCreator } from 'zustand'
import { FeedState, FeedItem, SearchSlice } from '../types'
import { SearchOptions, SearchResult } from '@/types'
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
          // Helper to recursively get feed IDs
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

      // Search: silent=false? Or silent=true?
      // Search failure is annoying if it pops a toast for network blip, but user initiated.
      // Usually search failure is significant. I will leave it non-silent (default).
      // Or maybe search should be silent and show error in UI?
      // User said "User operation fails -> show specific error". Search is user operation.
      // I'll keep default (silent: false).
      const results = (await invokeIPC(window.api.feed.search(query, options))) as SearchResult[]

      const feedItems: FeedItem[] = results.map((i: SearchResult) =>
        parseFeedItem(i, get().subscriptions.find((s) => s.id === i.feed_id)?.name)
      )

      set({ searchResults: feedItems })
    } catch {
       // Error handled by invokeIPC
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
