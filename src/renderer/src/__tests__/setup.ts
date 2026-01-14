import { vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock window.api for Electron IPC
const mockApi = {
  feed: {
    listFeeds: vi.fn().mockResolvedValue([]),
    listItems: vi.fn().mockResolvedValue([]),
    addFeed: vi.fn().mockResolvedValue(undefined),
    removeFeed: vi.fn().mockResolvedValue(undefined),
    fetchFeed: vi.fn().mockResolvedValue({ count: 0 }),
    validateFeed: vi.fn().mockResolvedValue({ valid: true, title: 'Test Feed' }),
    markAsRead: vi.fn().mockResolvedValue(undefined)
  },
  note: {
    save: vi.fn().mockResolvedValue({ id: 'test-note-id' }),
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined)
  },
  settings: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    selectDirectory: vi.fn().mockResolvedValue('/mock/path')
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
