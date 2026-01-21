import { StateCreator } from 'zustand'
import { FeedState, HighlightSlice } from '../types'
import { Highlight } from '@/types'
import { useToastStore } from '@/stores/toast.store'
import { invokeIPC } from '@/utils/ipc'

export const createHighlightSlice: StateCreator<FeedState, [], [], HighlightSlice> = (set, get) => ({
  highlights: new Map(),

  fetchHighlights: async (itemId) => {
    try {
      const result = await invokeIPC(window.api.highlight.listByItem(itemId), { showErrorToast: false })
      set((state) => {
        const newMap = new Map(state.highlights)
        newMap.set(itemId, result)
        return { highlights: newMap }
      })
    } catch (error) {
      console.error('Failed to fetch highlights:', error)
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
      await invokeIPC(window.api.highlight.create({
        id,
        feed_item_id: itemId,
        text,
        color,
        start_offset: start,
        end_offset: end
      }), { showErrorToast: false })
    } catch (error) {
      console.error('Failed to create highlight:', error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to create highlight', description: msg })
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
      await invokeIPC(window.api.highlight.update({ id, note, color }), { showErrorToast: false })
    } catch (error) {
      console.error('Failed to update highlight:', error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to update highlight', description: msg })
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
       await invokeIPC(window.api.highlight.delete(id), { showErrorToast: false })
     } catch (error) {
       console.error('Failed to delete highlight:', error)
       const msg = error instanceof Error ? error.message : String(error)
       useToastStore.getState().addToast({ type: 'error', title: 'Failed to delete highlight', description: msg })
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
