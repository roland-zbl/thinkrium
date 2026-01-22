import { create } from 'zustand'
import { format } from 'date-fns'
import { Note, DbNote, SaveNoteInput } from '@/types'
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
  createNote: (title: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
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
  createNote: async (title: string) => {
    try {
      const input: SaveNoteInput = {
        title,
        content: '', // Empty content for new note
        sourceType: 'manual'
      }
      const newNote = await invokeIPC(window.api.note.save(input))
      // Refetch notes to update the list
      await get().fetchNotes()
      // Select the new note
      get().selectNote(newNote.id)
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  },
  deleteNote: async (id: string) => {
    try {
      await invokeIPC(window.api.note.delete(id), { showErrorToast: false })
      set({ selectedNoteId: null, activeNote: null })
      await get().fetchNotes()
    } catch (error) {
      console.error('Failed to delete note:', error)
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
      const rawNote = await invokeIPC(window.api.note.get(id), { showErrorToast: false })
      if (rawNote) {
        const note: Note = {
          id: rawNote.id,
          title: rawNote.title,
          date: (() => {
            const d = rawNote.created_at || rawNote.date
            try {
              return d ? format(new Date(d), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
            } catch {
              return format(new Date(), 'yyyy-MM-dd')
            }
          })(),
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
      // Silent error for fetch
    }
  },

  fetchNotes: async () => {
    try {
      const rawNotes = await invokeIPC(window.api.note.list(), { showErrorToast: false })
      // 轉換 API 返回的格式為 Note 介面格式
      const notes: Note[] = rawNotes.map((n: DbNote) => ({
        id: n.id,
        title: n.title,
        date: (() => {
          const d = n.created_at || n.date
          try {
            return d ? format(new Date(d), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
          } catch {
            return format(new Date(), 'yyyy-MM-dd')
          }
        })(),
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
      // Silent error for fetch
    }
  }
}))
