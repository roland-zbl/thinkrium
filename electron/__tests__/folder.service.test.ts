import { describe, it, expect, vi, beforeEach } from 'vitest'
import { folderService } from '../services/folder.service'
import { getDatabase } from '../database'

// Mock getDatabase
vi.mock('../database', () => {
  const mockDb = {
    prepare: vi.fn(() => ({
      get: vi.fn(),
      run: vi.fn(),
      all: vi.fn()
    })),
    transaction: vi.fn((fn) => () => fn()), // Simplified transaction mock
    close: vi.fn()
  }

  return {
    getDatabase: vi.fn(() => mockDb),
    closeDatabase: vi.fn(),
    initDatabase: vi.fn(() => mockDb)
  }
})

describe('Folder Service', () => {
  const db = getDatabase()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createFolder should insert folder into database', () => {
    const stmtMock = {
      run: vi.fn()
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    folderService.createFolder('New Folder')

    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO folders'))
    expect(stmtMock.run).toHaveBeenCalledWith(expect.any(String), 'New Folder', null)
  })

  it('createFolder should support parentId', () => {
    const stmtMock = {
      run: vi.fn()
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    folderService.createFolder('Sub Folder', 'parent-id')

    expect(stmtMock.run).toHaveBeenCalledWith(expect.any(String), 'Sub Folder', 'parent-id')
  })

  it('renameFolder should update folder name', () => {
    const stmtMock = {
      run: vi.fn()
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    folderService.renameFolder('folder-id', 'Updated Name')

    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE folders SET name = ?'))
    expect(stmtMock.run).toHaveBeenCalledWith('Updated Name', 'folder-id')
  })

  it('deleteFolder should move contents to root and delete folder', () => {
    const stmtMock = {
      run: vi.fn()
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    folderService.deleteFolder('folder-id')

    // 1. Move feeds to root
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE feeds SET folder_id = NULL'))
    // 2. Move subfolders to root
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE folders SET parent_id = NULL'))
    // 3. Delete folder
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM folders'))
  })

  it('moveFolder should update parent_id', () => {
    const stmtMock = {
      run: vi.fn()
    }
    vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

    folderService.moveFolder('child-id', 'new-parent-id')

    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE folders SET parent_id = ?'))
    expect(stmtMock.run).toHaveBeenCalledWith('new-parent-id', 'child-id')
  })

  it('getAllFolders should return list of folders', () => {
      const mockFolders = [{ id: '1', name: 'Folder' }]
      const stmtMock = {
        all: vi.fn(() => mockFolders)
      }
      vi.spyOn(db, 'prepare').mockReturnValue(stmtMock as any)

      const folders = folderService.getAllFolders()

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM folders'))
      expect(folders).toEqual(mockFolders)
    })
})
