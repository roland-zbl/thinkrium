import { ipcMain } from 'electron'
import { folderService, DbFolder } from '../services/folder.service'
import { handleIPC } from '../utils/ipc-wrapper'

export function initFolderIPC(): void {
  ipcMain.handle('folder:create', (_, { name, parentId }: { name: string; parentId?: string }) =>
    handleIPC((): void => {
      folderService.createFolder(name, parentId)
    })
  )

  ipcMain.handle('folder:rename', (_, { id, name }: { id: string; name: string }) =>
    handleIPC((): void => {
      folderService.renameFolder(id, name)
    })
  )

  ipcMain.handle('folder:delete', (_, id: string) =>
    handleIPC((): void => {
      folderService.deleteFolder(id)
    })
  )

  ipcMain.handle('folder:move', (_, { id, newParentId }: { id: string; newParentId: string | null }) =>
    handleIPC((): void => {
      folderService.moveFolder(id, newParentId)
    })
  )

  ipcMain.handle('folder:list', () =>
    handleIPC((): DbFolder[] => {
      return folderService.getAllFolders()
    })
  )
}
