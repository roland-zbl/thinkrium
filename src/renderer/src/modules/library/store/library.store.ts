import { create } from 'zustand'
import { Note, SaveNoteInput } from '@/types'
import { invokeIPC } from '@/utils/ipc'
import { useToastStore } from '@/stores/toast.store'
import { parseDbNote } from '@/utils/transform'


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
  syncNotes: () => Promise<void>
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
      // invokeIPC handles Toast/Log on error.
      const newNote = await invokeIPC(window.api.note.save(input))

      // Refetch notes to update the list
      await get().fetchNotes()
      // Select the new note
      get().selectNote(newNote.id)
    } catch {
      // Error handled by invokeIPC
    }
  },
  deleteNote: async (id: string) => {
    try {
      // invokeIPC handles Toast/Log on error.
      await invokeIPC(window.api.note.delete(id))
      set({ selectedNoteId: null, activeNote: null })
      await get().fetchNotes()
    } catch {
      // Error handled by invokeIPC
    }
  },
  syncNotes: async () => {
    try {
      // invokeIPC handles Toast/Log on error.
      const result = await invokeIPC(window.api.note.sync())
      if (result.removed > 0) {
        useToastStore.getState().addToast({
          type: 'info',
          title: '資料庫已同步',
          description: `已清理 ${result.removed} 筆孤立記錄`
        })
        await get().fetchNotes()
      }
    } catch {
      // Error handled by invokeIPC
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
      // Fetch operations: silent=true (no toast), logs handled by invokeIPC
      const rawNote = await invokeIPC(window.api.note.get(id), { silent: true })
      if (rawNote) {
        set({ activeNote: parseDbNote(rawNote) })
      }
    } catch {
      // Error handled by invokeIPC (logged)
    }
  },

  fetchNotes: async () => {
    try {
      // Fetch operations: silent=true (no toast), logs handled by invokeIPC
      const rawNotes = await invokeIPC(window.api.note.list(), { silent: true })
      // 轉換 API 返回的格式為 Note 介面格式
      const notes: Note[] = rawNotes.map(parseDbNote)
      set({ notes })
    } catch {
       // Error handled by invokeIPC (logged)
    }
  }
}))
