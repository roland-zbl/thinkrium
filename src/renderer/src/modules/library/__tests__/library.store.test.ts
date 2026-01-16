import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLibraryStore } from '../store/library.store'
import { Note } from '@/types'

// Mock window.api
const mockApi = {
  note: {
    list: vi.fn(),
    get: vi.fn()
  }
}
global.window = {
  // @ts-ignore
  api: mockApi
}

describe('LibraryStore', () => {
  beforeEach(() => {
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

  it('fetchNotes should update notes state', async () => {
    const mockNotes = [
      { id: '1', title: 'Note 1', created_at: '2023-01-01', type: 'note', projects: [], tags: '[]' }
    ]
    // Fix: Return IPCResult format
    mockApi.note.list.mockResolvedValue({ success: true, data: mockNotes })

    await useLibraryStore.getState().fetchNotes()

    const { notes } = useLibraryStore.getState()
    expect(notes).toHaveLength(1)
    expect(notes[0].title).toBe('Note 1')
  })

  it('selectNote should trigger fetchNote', async () => {
    const mockNoteDetail = {
      id: '1',
      title: 'Note 1',
      created_at: '2023-01-01',
      type: 'note',
      projects: [],
      tags: '[]',
      content: 'Detailed content'
    }
    // Fix: Return IPCResult format
    mockApi.note.get.mockResolvedValue({ success: true, data: mockNoteDetail })

    // Call selectNote which internally calls fetchNote
    useLibraryStore.getState().selectNote('1')

    // Wait for the async fetchNote to complete
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockApi.note.get).toHaveBeenCalledWith('1')

    const { activeNote } = useLibraryStore.getState()
    expect(activeNote).toBeDefined()
    expect(activeNote?.content).toBe('Detailed content')
  })

  it('selectNote(null) should clear activeNote', () => {
    useLibraryStore.setState({ activeNote: { id: '1' } as Note })

    useLibraryStore.getState().selectNote(null)

    expect(useLibraryStore.getState().activeNote).toBeNull()
    expect(useLibraryStore.getState().selectedNoteId).toBeNull()
  })
})
