import { ipcMain } from 'electron'
import { noteService } from '../services/note.service'
import { SaveNoteInput, NoteFilter, NoteUpdate } from '../../src/renderer/src/modules/note/types'
import { getDatabase } from '../database'
import { join } from 'path'
import { readFile } from 'fs/promises'

/**
 * 初始化筆記模組的 IPC 處理器
 */
export function initNoteIPC(): void {
  const db = getDatabase()

  // 保存筆記
  ipcMain.handle('note:save', async (_, input: SaveNoteInput) => {
    try {
      return await noteService.saveNote(input)
    } catch (error: any) {
      console.error('[NoteIPC] Failed to save note:', error)
      throw error
    }
  })

  // 獲取筆記列表
  ipcMain.handle('note:list', async (_, filter?: NoteFilter) => {
    try {
      let query = 'SELECT * FROM notes ORDER BY updated_at DESC'
      if (filter?.limit) {
        query += ` LIMIT ${filter.limit}`
      }
      const notes = db.prepare(query).all() as any[]
      return notes.map((note) => ({
        ...note,
        tags: JSON.parse(note.tags || '[]'),
        aliases: JSON.parse(note.aliases || '[]')
      }))
    } catch (error) {
      console.error('[NoteIPC] Failed to list notes:', error)
      throw error
    }
  })

  // 獲取單個筆記（含文件內容）
  ipcMain.handle('note:get', async (_, id: string) => {
    try {
      const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as any
      if (!note) return null

      const rootDir = await noteService.getRootDir()
      if (!rootDir) throw new Error('未設定存儲目錄')

      const filePath = join(rootDir, note.file_path)
      const content = await readFile(filePath, 'utf-8')

      return {
        ...note,
        content,
        tags: JSON.parse(note.tags || '[]'),
        aliases: JSON.parse(note.aliases || '[]')
      }
    } catch (error) {
      console.error('[NoteIPC] Failed to get note:', error)
      throw error
    }
  })

  // 更新筆記
  ipcMain.handle('note:update', async (_, id: string, updates: NoteUpdate) => {
    try {
      return await noteService.updateNote(id, updates)
    } catch (error: any) {
      console.error('[NoteIPC] Failed to update note:', error)
      throw error
    }
  })

  // 刪除筆記
  ipcMain.handle('note:delete', async (_, id: string) => {
    try {
      await noteService.deleteNote(id)
    } catch (error: any) {
      console.error('[NoteIPC] Failed to delete note:', error)
      throw error
    }
  })
}
