import { create } from 'zustand'
import { FeedState } from './types'
import { createItemsSlice } from './slices/items.slice'
import { createSubscriptionsSlice } from './slices/subscriptions.slice'
import { createFoldersSlice } from './slices/folders.slice'
import { createSearchSlice } from './slices/search.slice'
import { createHighlightSlice } from './slices/highlight.slice'

export type { FeedItem, Subscription } from './types'

export const useFeedStore = create<FeedState>()((...a) => ({
  ...createItemsSlice(...a),
  ...createSubscriptionsSlice(...a),
  ...createFoldersSlice(...a),
  ...createSearchSlice(...a),
  ...createHighlightSlice(...a),
}))
