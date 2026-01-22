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
    it('should fetch notes successfully and normalize dates', async () => {
      const mockNotes = [
        { id: '1', title: 'Note 1', created_at: '2023-01-01T10:00:00.000Z', type: 'note', tags: [], projects: [] },
        { id: '2', title: 'Note 2', created_at: null, date: '2023-01-02', type: 'note', tags: '["tag1"]', projects: [] },
        { id: '3', title: 'Note 3', created_at: undefined, date: undefined, type: 'note', tags: [], projects: [] } // Fallback to current date
      ]

      window.api.note.list = vi.fn().mockResolvedValue({ success: true, data: mockNotes })

      await act(async () => {
        await useLibraryStore.getState().fetchNotes()
      })

      const { notes } = useLibraryStore.getState()
      expect(notes).toHaveLength(3)
      expect(notes[0].date).toBe('2023-01-01') // ISO to YYYY-MM-DD
      expect(notes[1].date).toBe('2023-01-02') // Preserves YYYY-MM-DD
      // Note 3 defaults to today, hard to test exact string without mocking Date, but should be YYYY-MM-DD length
      expect(notes[2].date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
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

  describe('createNote', () => {
    it('should create a note and select it', async () => {
      const newNote = { id: 'new-1', title: 'New Note', created_at: '2023-01-01', type: 'note' }
      window.api.note.save = vi.fn().mockResolvedValue({ success: true, data: newNote })
      // fetchNotes will be called after create, mock it too
      window.api.note.list = vi.fn().mockResolvedValue({ success: true, data: [newNote] })
      window.api.note.get = vi.fn().mockResolvedValue({ success: true, data: newNote }) // for selectNote

      await act(async () => {
        await useLibraryStore.getState().createNote('New Note')
      })

      expect(window.api.note.save).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Note',
        sourceType: 'manual'
      }))
      expect(window.api.note.list).toHaveBeenCalled()
      expect(useLibraryStore.getState().selectedNoteId).toBe('new-1')
    })
  })

  describe('deleteNote', () => {
    it('should delete a note and refresh list', async () => {
      window.api.note.delete = vi.fn().mockResolvedValue({ success: true })
      window.api.note.list = vi.fn().mockResolvedValue({ success: true, data: [] })

      useLibraryStore.setState({ selectedNoteId: 'del-1' })

      await act(async () => {
        await useLibraryStore.getState().deleteNote('del-1')
      })

      expect(window.api.note.delete).toHaveBeenCalledWith('del-1')
      expect(window.api.note.list).toHaveBeenCalled()
      expect(useLibraryStore.getState().selectedNoteId).toBeNull()
      expect(useLibraryStore.getState().activeNote).toBeNull()
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
      // Wait for async fetch to complete
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
