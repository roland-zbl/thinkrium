import { StateCreator } from 'zustand'
import { FeedState, HighlightSlice } from '../types'
import { Highlight } from '@/types'
import { invokeIPC } from '@/utils/ipc'

export const createHighlightSlice: StateCreator<FeedState, [], [], HighlightSlice> = (set, get) => ({
  highlights: new Map(),

  fetchHighlights: async (itemId) => {
    try {
      // Fetch: silent=true
      const result = await invokeIPC(window.api.highlight.listByItem(itemId), { silent: true })
      set((state) => {
        const newMap = new Map(state.highlights)
        newMap.set(itemId, result)
        return { highlights: newMap }
      })
    } catch {
       // Error handled by invokeIPC
    }
  },

  createHighlight: async (itemId, text, start, end, color) => {
    const id = crypto.randomUUID()
    const highlight: Highlight = {
      id,
      feed_item_id: itemId,
      text,
      note: null,
      color,
      start_offset: start,
      end_offset: end,
      created_at: new Date().toISOString()
    }

    // Optimistic Update
    set((state) => {
      const newMap = new Map(state.highlights)
      const list = newMap.get(itemId) || []
      newMap.set(itemId, [...list, highlight])
      return { highlights: newMap }
    })

    try {
      // invokeIPC handles Toast/Log
      await invokeIPC(window.api.highlight.create({
        id,
        feed_item_id: itemId,
        text,
        color,
        start_offset: start,
        end_offset: end
      }))
    } catch {
      // Revert optimism
      set((state) => {
        const newMap = new Map(state.highlights)
        const list = newMap.get(itemId) || []
        newMap.set(itemId, list.filter(h => h.id !== id))
        return { highlights: newMap }
      })
    }
  },

  updateHighlight: async (id, note, color) => {
    const { highlights } = get()
    // Find item id for this highlight to update store
    let itemId: string | undefined
    let currentHighlight: Highlight | undefined

    for (const [key, list] of highlights.entries()) {
      const found = list.find(h => h.id === id)
      if (found) {
        itemId = key
        currentHighlight = found
        break
      }
    }

    if (!itemId || !currentHighlight) return

    // Optimistic
    set((state) => {
      const newMap = new Map(state.highlights)
      const list = newMap.get(itemId!) || []
      newMap.set(itemId!, list.map(h => h.id === id ? { ...h, note: note ?? h.note, color: color ?? h.color } : h))
      return { highlights: newMap }
    })

    try {
      await invokeIPC(window.api.highlight.update({ id, note, color }))
    } catch {
      // Revert
      set((state) => {
        const newMap = new Map(state.highlights)
        const list = newMap.get(itemId!) || []
        newMap.set(itemId!, list.map(h => h.id === id ? currentHighlight! : h))
        return { highlights: newMap }
      })
    }
  },

  deleteHighlight: async (id, itemId) => {
     // Optimistic
     const { highlights } = get()
     const list = highlights.get(itemId) || []
     const highlight = list.find(h => h.id === id)

     set((state) => {
       const newMap = new Map(state.highlights)
       const list = newMap.get(itemId) || []
       newMap.set(itemId, list.filter(h => h.id !== id))
       return { highlights: newMap }
     })

     try {
       await invokeIPC(window.api.highlight.delete(id))
     } catch {
       // Revert
       if (highlight) {
          set((state) => {
            const newMap = new Map(state.highlights)
            const list = newMap.get(itemId) || []
            newMap.set(itemId, [...list, highlight])
            return { highlights: newMap }
          })
       }
     }
  }
})
