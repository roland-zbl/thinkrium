import { describe, it, expect, vi, beforeEach } from 'vitest'
import { noteService } from '../services/note.service'
import { getDatabase } from '../database'
import { join } from 'path'
import * as fsPromises from 'fs/promises'
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
    }
  }
})

// Mock electron net
vi.mock('electron', () => ({
  net: {
    fetch: vi.fn()
  }
}))

describe('Note Service', () => {
  const db = getDatabase()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset existsSync to true by default to avoid unexpected side effects
    vi.mocked(existsSync).mockReturnValue(true)
  })

  it('saveNote should create file and insert into database', async () => {
    // Setup mocks
    const rootDir = '/tmp/notes'

    // Mock getRootDir (which queries DB)
    const stmtMock = {
      get: vi.fn().mockReturnValue({ value: rootDir }),
      run: vi.fn()
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    // Force existsSync to false so mkdir is called
    vi.mocked(existsSync).mockReturnValue(false)

    const input = {
      title: 'Test Note',
      content: '<p>Hello</p>',
      sourceType: 'manual',
      tags: ['test']
    }

    const result = await noteService.saveNote(input as any)

    // Verify DB operations
    // 1. Get root dir
    // 2. Insert note
    expect(db.prepare).toHaveBeenCalledTimes(2)
    expect(stmtMock.run).toHaveBeenCalled()

    // Verify File operations
    expect(fsPromises.mkdir).toHaveBeenCalled()
    expect(fsPromises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(join(rootDir, 'notes')),
      expect.any(String),
      'utf-8'
    )

    expect(result.title).toBe(input.title)
  })

  it('updateNote should update file content and database', async () => {
    const rootDir = '/tmp/notes'
    const noteId = 'note-1'
    const notePath = 'notes/2024/01/note.md'

    // Mock DB calls:
    // 1. getRootDir
    // 2. get note (existing)
    // 3. update note
    // 4. get note (updated return)

    const stmtMock = {
      get: vi.fn()
        .mockReturnValueOnce({ value: rootDir }) // getRootDir
        .mockReturnValueOnce({ id: noteId, file_path: notePath }) // existing note
        .mockReturnValueOnce({ id: noteId, title: 'Updated' }), // updated note
      run: vi.fn()
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    // Mock reading old file
    vi.spyOn(fsPromises, 'readFile').mockResolvedValue('---\nid: "note-1"\n---\n\nOld Content')

    const updates = {
      content: 'New Content'
    }

    await noteService.updateNote(noteId, updates)

    // Verify file update
    expect(fsPromises.writeFile).toHaveBeenCalledWith(
      join(rootDir, notePath),
      expect.stringContaining('New Content'),
      'utf-8'
    )

    // Verify DB update
    expect(stmtMock.run).toHaveBeenCalledWith(expect.objectContaining({
      id: noteId
    }))
  })

  it('deleteNote should remove file and database entry', async () => {
    const rootDir = '/tmp/notes'
    const noteId = 'note-1'
    const notePath = 'notes/2024/01/note.md'

    const stmtMock = {
      get: vi.fn()
        .mockReturnValueOnce({ value: rootDir }) // getRootDir
        .mockReturnValueOnce({ id: noteId, file_path: notePath }), // existing note
      run: vi.fn()
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    await noteService.deleteNote(noteId)

    // Verify file deletion
    expect(fsPromises.unlink).toHaveBeenCalledWith(join(rootDir, notePath))
    expect(fsPromises.rm).toHaveBeenCalled() // attachments

    // Verify DB deletion
    expect(stmtMock.run).toHaveBeenCalledWith(noteId)
  })
})
