import { create } from 'zustand'
import { useToastStore } from '@/stores/toast.store'

export interface Note {
  id: string
  title: string
  date: string
  type: string
  projects: string[]
  tags: string[]
}

interface LibraryState {
  notes: Note[]
  selectedNoteId: string | null
  filters: {
    type: string
    tag: string
    date: string
    project: string
  }

  // Actions
  fetchNotes: () => Promise<void>
  selectNote: (id: string | null) => void
  setFilter: (key: keyof LibraryState['filters'], value: string) => void
  resetFilters: () => void
}

export const useLibraryStore = create<LibraryState>((set) => ({
  notes: [],
  selectedNoteId: null,
  filters: {
    type: '全部',
    tag: '全部',
    date: '全部',
    project: '全部'
  },

  selectNote: (id) => set({ selectedNoteId: id }),
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    })),
  resetFilters: () =>
    set({
      filters: { type: '全部', tag: '全部', date: '全部', project: '全部' }
    }),

  fetchNotes: async () => {
    try {
      const rawNotes = await window.api.note.list()
      // 轉換 API 返回的格式為 Note 介面格式
      const notes: Note[] = rawNotes.map((n: any) => ({
        id: n.id,
        title: n.title,
        date: n.created_at || n.date || new Date().toISOString().split('T')[0],
        type: n.source_type || n.type || 'note',
        projects: n.projects || [],
        tags: (() => {
          // 處理 tags 可能是 JSON 字串或陣列的情況
          if (typeof n.tags === 'string') {
            try {
              return JSON.parse(n.tags) || []
            } catch {
              return []
            }
          }
          return n.tags || []
        })()
      }))
      set({ notes })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to fetch notes',
        description: msg
      })
      console.error('Failed to fetch notes:', error)
    }
  }
}))
