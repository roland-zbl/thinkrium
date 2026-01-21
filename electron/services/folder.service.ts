import { Database } from 'better-sqlite3'
import { getDatabase } from '../database'
import { randomUUID } from 'crypto'

export interface DbFolder {
  id: string
  name: string
  parent_id: string | null
  position: number
  created_at: string
}

export class FolderService {
  private db: Database | null = null

  private getDb(): Database {
    if (!this.db) {
      this.db = getDatabase()
    }
    return this.db
  }

  createFolder(name: string, parentId?: string): void {
    const id = randomUUID()
    const stmt = this.getDb().prepare(`
      INSERT INTO folders (id, name, parent_id)
      VALUES (?, ?, ?)
    `)
    stmt.run(id, name, parentId || null)
  }

  renameFolder(id: string, name: string): void {
    const stmt = this.getDb().prepare(`
      UPDATE folders SET name = ? WHERE id = ?
    `)
    stmt.run(name, id)
  }

  deleteFolder(id: string): void {
    const db = this.getDb()
    const transaction = db.transaction(() => {
      console.log('[FolderService] Deleting folder:', id)
      // 1. Move feeds in this folder to root (folder_id = NULL)
      const feedRes = db.prepare('UPDATE feeds SET folder_id = NULL WHERE folder_id = ?').run(id)
      console.log('[FolderService] Moved feeds:', feedRes.changes)

      // 2. Move subfolders to root (parent_id = NULL)
      const folderRes = db.prepare('UPDATE folders SET parent_id = NULL WHERE parent_id = ?').run(id)
      console.log('[FolderService] Moved subfolders:', folderRes.changes)

      // 3. Delete the folder
      const delRes = db.prepare('DELETE FROM folders WHERE id = ?').run(id)
      console.log('[FolderService] Deleted folder:', delRes.changes)
      
      if (delRes.changes === 0) {
          console.warn('[FolderService] No folder deleted! ID might be wrong or missing.')
      }
    })

    transaction()
  }

  moveFolder(id: string, newParentId: string | null): void {
    // Prevent circular reference
    if (id === newParentId) return

    // Check if newParentId is a descendant of id
    // This requires a recursive CTE or iterative check, but for depth=3, maybe simple check is okay.
    // For now, trust the UI or add simple check.

    const stmt = this.getDb().prepare(`
      UPDATE folders SET parent_id = ? WHERE id = ?
    `)
    stmt.run(newParentId || null, id)
  }

  getAllFolders(): DbFolder[] {
    return this.getDb().prepare('SELECT * FROM folders ORDER BY position ASC, created_at ASC').all() as DbFolder[]
  }
}

export const folderService = new FolderService()
