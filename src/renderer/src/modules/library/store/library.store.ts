import { create } from 'zustand'
import { mockNotes } from '../../../mocks'

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
  selectNote: (id: string | null) => void
  setFilter: (key: keyof LibraryState['filters'], value: string) => void
  resetFilters: () => void
}

export const useLibraryStore = create<LibraryState>((set) => ({
  notes: mockNotes as Note[],
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
    })
}))
