import { create } from 'zustand'
import { Note, DbNote } from '@/types'
import { invokeIPC } from '@/utils/ipc'


interface LibraryState {
  notes: Note[]
  selectedNoteId: string | null
  activeNote: Note | null
  filters: {
    type: string
    tag: string
    date: string
    project: string
  }

  // Actions
  fetchNotes: () => Promise<void>
  fetchNote: (id: string) => Promise<void>
  selectNote: (id: string | null) => void
  setFilter: (key: keyof LibraryState['filters'], value: string) => void
  resetFilters: () => void
  getFilteredNotes: () => Note[]
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  notes: [],
  selectedNoteId: null,
  activeNote: null,
  filters: {
    type: '全部',
    tag: '全部',
    date: '全部',
    project: '全部'
  },

  selectNote: (id) => {
    set({ selectedNoteId: id })
    if (id) {
      get().fetchNote(id)
    } else {
      set({ activeNote: null })
    }
  },
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    })),
  resetFilters: () =>
    set({
      filters: { type: '全部', tag: '全部', date: '全部', project: '全部' }
    }),

  getFilteredNotes: () => {
    const { notes, filters } = get()
    return notes.filter((note) => {
      // Type filter
      if (filters.type !== '全部' && note.type !== filters.type) return false

      // Tag filter
      if (filters.tag !== '全部' && !note.tags?.includes(filters.tag)) return false

      // Date filter
      if (filters.date !== '全部' && note.date !== filters.date) return false

      // Project filter
      if (filters.project !== '全部' && !note.projects?.includes(filters.project)) return false

      return true
    })
  },

  fetchNote: async (id: string) => {
    try {
      const rawNote = await invokeIPC(window.api.note.get(id))
      if (rawNote) {
        const note: Note = {
          id: rawNote.id,
          title: rawNote.title,
          date: rawNote.created_at || rawNote.date || new Date().toISOString().split('T')[0],
          type: rawNote.source_type || rawNote.type || 'note',
          projects: rawNote.projects || [],
          content: rawNote.content,
          tags: (() => {
            if (typeof rawNote.tags === 'string') {
              try {
                return JSON.parse(rawNote.tags) || []
              } catch {
                return []
              }
            }
            return (rawNote.tags as string[]) || []
          })(),
          quick_note: (() => {
            if (!rawNote.content) return undefined
            const match = rawNote.content.match(/^quick_note:\s*"([^"]+)"/m)
            return match ? match[1] : undefined
          })()
        }
        set({ activeNote: note })
      }
    } catch (error) {
      console.error('Failed to fetch note details:', error)
      // Toast handled by invokeIPC
    }
  },

  fetchNotes: async () => {
    try {
      const rawNotes = await invokeIPC(window.api.note.list())
      // 轉換 API 返回的格式為 Note 介面格式
      const notes: Note[] = rawNotes.map((n: DbNote) => ({
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
          return (n.tags as string[]) || []
        })()
      }))
      set({ notes })
    } catch (error) {
      console.error('Failed to fetch notes:', error)
      // Toast handled by invokeIPC
    }
  }
}))
