import { ipcMain, dialog } from 'electron'
import { handleIPC } from '../utils/ipc-wrapper'

export function initDialogIPC(): void {
  ipcMain.handle('dialog:openFile', (_, options: Electron.OpenDialogOptions) =>
    handleIPC(async () => {
      const { filePaths } = await dialog.showOpenDialog({
        ...options,
        properties: ['openFile']
      })
      return filePaths[0] || null
    })
  )
}
