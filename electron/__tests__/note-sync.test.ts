import { describe, it, expect, vi, beforeEach } from 'vitest'
import { noteService } from '../services/note.service'
import { getDatabase } from '../database'
import { join } from 'path'
import { existsSync } from 'fs'

// Mock getDatabase
vi.mock('../database', () => {
  const mockDb = {
    prepare: vi.fn(() => ({
      get: vi.fn(),
      run: vi.fn(),
      all: vi.fn()
    })),
    close: vi.fn()
  }

  return {
    getDatabase: vi.fn(() => mockDb),
    closeDatabase: vi.fn(),
    initDatabase: vi.fn(() => mockDb)
  }
})

// Mock fs/promises
vi.mock('fs/promises', () => {
  const mkdir = vi.fn()
  const writeFile = vi.fn()
  const readFile = vi.fn()
  const unlink = vi.fn()
  const rm = vi.fn()
  return {
    default: { mkdir, writeFile, readFile, unlink, rm },
    mkdir,
    writeFile,
    readFile,
    unlink,
    rm
  }
})

// Mock fs existsSync (used in NoteService)
vi.mock('fs', () => {
  const existsSync = vi.fn(() => true)
  return {
    default: { existsSync },
    existsSync
  }
})

// Mock TurndownService
vi.mock('turndown', () => {
  return {
    default: class {
      turndown = vi.fn((html) => `Markdown of ${html}`)
      addRule = vi.fn()
    }
  }
})

// Mock electron net
vi.mock('electron', () => ({
  net: {
    fetch: vi.fn()
  }
}))

describe('Note Sync', () => {
  const db = getDatabase()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should remove orphaned notes from database', async () => {
    const rootDir = '/tmp/notes'

    // Mock getRootDir
    const stmtMock = {
      get: vi.fn().mockReturnValue({ value: rootDir }),
      run: vi.fn(),
      all: vi.fn()
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    // Mock DB returning 2 notes
    const notes = [
      { id: '1', file_path: 'exists.md' },
      { id: '2', file_path: 'missing.md' }
    ]
    stmtMock.all.mockReturnValue(notes)

    // Mock file existence
    // exists.md exists, missing.md does not
    vi.mocked(existsSync).mockImplementation((path: any) => {
      if (path === join(rootDir, 'exists.md')) return true
      if (path === join(rootDir, 'missing.md')) return false
      return false
    })

    const result = await noteService.syncWithFileSystem()

    // Should return 1 removed
    expect(result.removed).toBe(1)

    // Should delete the missing note from DB
    expect(db.prepare).toHaveBeenCalledWith('DELETE FROM notes WHERE id = ?')
    expect(stmtMock.run).toHaveBeenCalledWith('2')

    // Should NOT delete the existing note
    expect(stmtMock.run).not.toHaveBeenCalledWith('1')
  })

  it('should return 0 if no rootDir configured', async () => {
    // Mock getRootDir returning null
    const stmtMock = {
      get: vi.fn().mockReturnValue(undefined),
      run: vi.fn(),
      all: vi.fn()
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    const result = await noteService.syncWithFileSystem()

    expect(result.removed).toBe(0)
    expect(db.prepare).toHaveBeenCalledWith('SELECT value FROM settings WHERE key = ?')
    // Should not proceed to query notes
    expect(db.prepare).not.toHaveBeenCalledWith('SELECT id, file_path FROM notes')
  })

  it('should do nothing if all files exist', async () => {
    const rootDir = '/tmp/notes'

    // Mock getRootDir
    const stmtMock = {
      get: vi.fn().mockReturnValue({ value: rootDir }),
      run: vi.fn(),
      all: vi.fn()
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    // Mock DB returning 1 note
    const notes = [
      { id: '1', file_path: 'exists.md' }
    ]
    stmtMock.all.mockReturnValue(notes)

    // Mock file existence
    vi.mocked(existsSync).mockReturnValue(true)

    const result = await noteService.syncWithFileSystem()

    expect(result.removed).toBe(0)
    expect(stmtMock.run).not.toHaveBeenCalled()
  })
})
