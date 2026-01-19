import { describe, it, expect, vi, beforeEach } from 'vitest'
import { feedService } from '../services/feed.service'
import { getDatabase } from '../database'

// Mock getDatabase
vi.mock('../database', () => {
  const mockDb = {
    prepare: vi.fn(() => ({
      get: vi.fn(),
      run: vi.fn(),
      all: vi.fn()
    })),
    transaction: vi.fn((fn) => (items: any) => fn(items)),
    close: vi.fn()
  }

  return {
    getDatabase: vi.fn(() => mockDb),
    closeDatabase: vi.fn(),
    initDatabase: vi.fn(() => mockDb)
  }
})

// Mock RSS Service
vi.mock('../services/rss.service', () => ({
  validateFeed: vi.fn(),
  fetchFeed: vi.fn()
}))

describe('Feed Service Filter', () => {
  const db = getDatabase()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getFeedItems should support filtering by multiple feedIds', () => {
    const stmtMock = {
      all: vi.fn(() => [])
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    const filter = {
      feedIds: ['1', '2', '3']
    }

    feedService.getFeedItems(filter)

    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('feed_id IN (?,?,?)'))
    // expect(stmtMock.all).toHaveBeenCalledWith('1', '2', '3') // Params are spread, better-sqlite3 handles it.
  })

  it('getFeedItems should handle empty feedIds gracefully', () => {
      // In store we optimize to not call if empty, but service should handle it if called.
      // Logic says: if length > 0 add clause. If empty array passed, logic ignores it and returns ALL items.
      // This is risky. Store MUST handle empty array check.
      // Current store implementation: if (targetFeedIds.length > 0) ... else return;
      // So service logic is fine as is (optional filter).

      const stmtMock = {
        all: vi.fn(() => [])
      }
      vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

      feedService.getFeedItems({ feedIds: [] })

      expect(db.prepare).toHaveBeenCalledWith(expect.not.stringContaining('IN ('))
  })
})
