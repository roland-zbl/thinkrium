import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLibraryStore } from '../library.store'
import { act } from '@testing-library/react'
import { Note } from '@/types'

describe('LibraryStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useLibraryStore.setState({
      notes: [],
      selectedNoteId: null,
      activeNote: null,
      filters: {
        type: '全部',
        tag: '全部',
        date: '全部',
        project: '全部'
      }
    })
    vi.clearAllMocks()
  })

  describe('fetchNotes', () => {
    it('should fetch notes successfully', async () => {
      const mockNotes = [
        { id: '1', title: 'Note 1', created_at: '2023-01-01', type: 'note', tags: [], projects: [] },
        { id: '2', title: 'Note 2', created_at: '2023-01-02', type: 'note', tags: '["tag1"]', projects: [] }
      ]

      window.api.note.list = vi.fn().mockResolvedValue({ success: true, data: mockNotes })

      await act(async () => {
        await useLibraryStore.getState().fetchNotes()
      })

      const { notes } = useLibraryStore.getState()
      expect(notes).toHaveLength(2)
      expect(notes[0].title).toBe('Note 1')
      // Check date normalization
      expect(notes[0].date).toBe('2023-01-01')
      // Check tag parsing
      expect(notes[1].tags).toEqual(['tag1'])
    })

    it('should handle fetch errors gracefully', async () => {
      // Mock console.error to avoid noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      window.api.note.list = vi.fn().mockResolvedValue({
        success: false,
        error: { message: 'Fetch failed' }
      })

      await useLibraryStore.getState().fetchNotes()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('selectNote', () => {
    it('should select note and fetch details', async () => {
      const mockNote = {
        id: '1',
        title: 'Detail Note',
        content: 'Content',
        created_at: '2023-01-01',
        type: 'note',
        tags: [],
        projects: []
      }

      window.api.note.get = vi.fn().mockResolvedValue({ success: true, data: mockNote })

      await act(async () => {
        useLibraryStore.getState().selectNote('1')
      })

      expect(useLibraryStore.getState().selectedNoteId).toBe('1')
      expect(window.api.note.get).toHaveBeenCalledWith('1')
      // Wait for async fetch to complete (it's triggered by selectNote but not awaited by it)
      // Since selectNote is sync but triggers async, we might need to wait a tick or expose the promise
      // However, fetchNote is async in the store but selectNote doesn't return it.
      // We can verify activeNote is set eventually.

      // Actually selectNote implementation:
      // selectNote: (id) => { set({ selectedNoteId: id }); if (id) { get().fetchNote(id) } ... }
      // It calls fetchNote which is async, but doesn't await it.

      // Let's call fetchNote directly to verify it works, or wait.
      // Since we can't await the internal promise, we can assume the mock resolves quickly.
      // Or we can await a small delay.
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(useLibraryStore.getState().activeNote).toEqual(expect.objectContaining({
        id: '1',
        title: 'Detail Note'
      }))
    })

    it('should clear active note when deselected', () => {
      useLibraryStore.setState({
        selectedNoteId: '1',
        activeNote: { id: '1' } as Note
      })

      act(() => {
        useLibraryStore.getState().selectNote(null)
      })

      expect(useLibraryStore.getState().selectedNoteId).toBeNull()
      expect(useLibraryStore.getState().activeNote).toBeNull()
    })
  })

  describe('setFilter', () => {
    it('should update filter state', () => {
      act(() => {
        useLibraryStore.getState().setFilter('type', 'article')
      })

      expect(useLibraryStore.getState().filters.type).toBe('article')
    })
  })

  describe('getFilteredNotes', () => {
    const mockNotes: Note[] = [
      { id: '1', title: 'Note 1', type: 'note', tags: ['work'], date: '2023-01-01', projects: ['proj1'], content: '' },
      { id: '2', title: 'Note 2', type: 'article', tags: ['personal'], date: '2023-01-02', projects: [], content: '' },
      { id: '3', title: 'Note 3', type: 'note', tags: ['work', 'urgent'], date: '2023-01-01', projects: ['proj2'], content: '' }
    ]

    beforeEach(() => {
      useLibraryStore.setState({ notes: mockNotes })
    })

    it('should return all notes when filters are default', () => {
      const filtered = useLibraryStore.getState().getFilteredNotes()
      expect(filtered).toHaveLength(3)
    })

    it('should filter by type', () => {
      useLibraryStore.getState().setFilter('type', 'article')
      const filtered = useLibraryStore.getState().getFilteredNotes()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('2')
    })

    it('should filter by tag', () => {
      useLibraryStore.getState().setFilter('tag', 'work')
      const filtered = useLibraryStore.getState().getFilteredNotes()
      expect(filtered).toHaveLength(2) // Note 1 and 3
    })

    it('should filter by date', () => {
      useLibraryStore.getState().setFilter('date', '2023-01-01')
      const filtered = useLibraryStore.getState().getFilteredNotes()
      expect(filtered).toHaveLength(2) // Note 1 and 3
    })

    it('should filter by project', () => {
      useLibraryStore.getState().setFilter('project', 'proj1')
      const filtered = useLibraryStore.getState().getFilteredNotes()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('1')
    })

    it('should combine filters', () => {
      useLibraryStore.setState({
        filters: {
          type: 'note',
          tag: 'work',
          date: '2023-01-01',
          project: '全部'
        }
      })
      const filtered = useLibraryStore.getState().getFilteredNotes()
      expect(filtered).toHaveLength(2) // Note 1 and 3 are note+work+date match

      // Refine to project proj2
      useLibraryStore.getState().setFilter('project', 'proj2')
      const filtered2 = useLibraryStore.getState().getFilteredNotes()
      expect(filtered2).toHaveLength(1)
      expect(filtered2[0].id).toBe('3')
    })
  })
})
