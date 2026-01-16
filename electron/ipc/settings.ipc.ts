import { ipcMain, dialog, BrowserWindow } from 'electron'
import { getDatabase } from '../database'
import { handleIPC } from '../utils/ipc-wrapper'

/**
 * 初始化設定模組的 IPC 處理器
 */
export function initSettingsIPC(): void {
  const db = getDatabase()

  // 獲取設定
  ipcMain.handle('settings:get', (_, key: string) =>
    handleIPC((): string | null => {
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
        | { value: string }
        | undefined
      return row ? row.value : null
    })
  )

  // 保存設定
  ipcMain.handle('settings:set', (_, key: string, value: string) =>
    handleIPC((): void => {
      db.prepare(
        `
        INSERT INTO settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `
      ).run(key, value)
    })
  )

  // 選擇目錄
  ipcMain.handle('settings:selectDirectory', () =>
    handleIPC(async () => {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      const { canceled, filePaths } = await dialog.showOpenDialog(focusedWindow!, {
        properties: ['openDirectory'],
        title: '選擇筆記存儲目錄'
      })
      if (canceled) {
        return null
      }
      return filePaths[0]
    })
  )
}
