import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { feedService } from '../services/feed.service'
import { getDatabase, closeDatabase } from '../database'
import * as rssService from '../services/rss.service'

// Mock getDatabase to return our spy object
// We need to mock the whole module to intercept getDatabase
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

describe('Feed Service', () => {
  const db = getDatabase()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAllFeeds should return feeds from database', () => {
    const mockFeeds = [{ id: '1', title: 'Test Feed' }]
    const stmtMock = {
      all: vi.fn(() => mockFeeds)
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    const feeds = feedService.getAllFeeds()

    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT'))
    expect(stmtMock.all).toHaveBeenCalled()
    expect(feeds).toEqual(mockFeeds)
  })

  it('addFeed should insert feed into database', () => {
    const feed = {
      id: '123',
      type: 'rss' as const,
      url: 'https://example.com/rss',
      title: 'Example',
      icon_url: null,
      last_fetched: null,
      fetch_interval: 30
    }

    const stmtMock = {
      run: vi.fn()
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    feedService.addFeed(feed)

    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO feeds'))
    expect(stmtMock.run).toHaveBeenCalledWith(feed)
  })

  it('addFeedItems should batch insert items', () => {
    const items = [
      { id: '1', title: 'Item 1' },
      { id: '2', title: 'Item 2' }
    ] as any

    const stmtMock = {
      run: vi.fn()
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    // The transaction mock executes the function immediately
    feedService.addFeedItems(items)

    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT OR IGNORE INTO feed_items'))
    // Called twice (once for each item)
    expect(stmtMock.run).toHaveBeenCalledTimes(2)
  })
})
