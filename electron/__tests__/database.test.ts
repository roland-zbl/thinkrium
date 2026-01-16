import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initDatabase, getDatabase, closeDatabase } from '../database'
import Database from 'better-sqlite3'

// Mock electron app
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/test-user-data')
  }
}))

// Mock fs
vi.mock('fs', () => {
  const existsSync = vi.fn(() => true)
  const mkdirSync = vi.fn()
  return {
    default: { existsSync, mkdirSync },
    existsSync,
    mkdirSync
  }
})

// Mock better-sqlite3
vi.mock('better-sqlite3', () => {
  // We need a standard function to be used as a constructor
  return {
    default: vi.fn(function() {
      return {
        pragma: vi.fn(),
        exec: vi.fn(),
        prepare: vi.fn(() => ({
          get: vi.fn(() => ({ count: 0 })),
          run: vi.fn(),
          all: vi.fn(() => [])
        })),
        close: vi.fn(),
        transaction: vi.fn((fn) => fn)
      }
    })
  }
})

describe('Database Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    closeDatabase()
  })

  afterEach(() => {
    closeDatabase()
  })

  it('initDatabase should create a new database connection and run migrations', () => {
    const db = initDatabase()

    // Check Constructor call
    expect(Database).toHaveBeenCalled()

    // Check Pragma
    expect(db.pragma).toHaveBeenCalledWith('journal_mode = WAL')
    expect(db.pragma).toHaveBeenCalledWith('foreign_keys = ON')

    // Check Migrations (exec called)
    expect(db.exec).toHaveBeenCalled()
  })

  it('getDatabase should throw if not initialized', () => {
    closeDatabase()
    expect(() => getDatabase()).toThrow('Database not initialized')
  })

  it('getDatabase should return the db instance if initialized', () => {
    const db = initDatabase()
    expect(getDatabase()).toBe(db)
  })
})
