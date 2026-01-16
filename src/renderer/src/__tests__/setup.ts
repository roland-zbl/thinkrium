import { vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

// Helper to return success IPCResult
const success = (data: any = undefined) => Promise.resolve({ success: true, data })

// Mock window.api for Electron IPC
const mockApi = {
  feed: {
    listFeeds: vi.fn().mockReturnValue(success([])),
    listItems: vi.fn().mockReturnValue(success([])),
    addFeed: vi.fn().mockReturnValue(success()),
    removeFeed: vi.fn().mockReturnValue(success()),
    fetchFeed: vi.fn().mockReturnValue(success({ count: 0 })),
    validateFeed: vi.fn().mockReturnValue(success({ valid: true, title: 'Test Feed' })),
    markAsRead: vi.fn().mockReturnValue(success())
  },
  note: {
    save: vi.fn().mockReturnValue(success({ id: 'test-note-id' })),
    list: vi.fn().mockReturnValue(success([])),
    get: vi.fn().mockReturnValue(success(null)),
    update: vi.fn().mockReturnValue(success()),
    delete: vi.fn().mockReturnValue(success())
  },
  project: {
    create: vi.fn().mockReturnValue(success()),
    list: vi.fn().mockReturnValue(success([])),
    addItem: vi.fn().mockReturnValue(success()),
    getItems: vi.fn().mockReturnValue(success([])),
    updateStatus: vi.fn().mockReturnValue(success())
  },
  settings: {
    get: vi.fn().mockReturnValue(success(null)),
    set: vi.fn().mockReturnValue(success()),
    selectDirectory: vi.fn().mockReturnValue(success('/mock/path'))
  }
}

Object.defineProperty(window, 'api', {
  value: mockApi,
  writable: true
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
