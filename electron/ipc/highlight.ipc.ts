import { ipcMain } from 'electron'
import { handleIPC } from '../utils/ipc-wrapper'
import { highlightService } from '../services/highlight.service'
import { CreateHighlightDTO, UpdateHighlightDTO } from '@shared/types/feed'

export function initHighlightIPC(): void {
  ipcMain.handle('highlight:create', (_, data: CreateHighlightDTO) =>
    handleIPC(() => {
      highlightService.createHighlight(data)
    })
  )

  ipcMain.handle('highlight:update', (_, data: UpdateHighlightDTO) =>
    handleIPC(() => {
      highlightService.updateHighlight(data)
    })
  )

  ipcMain.handle('highlight:delete', (_, id: string) =>
    handleIPC(() => {
      highlightService.deleteHighlight(id)
    })
  )

  ipcMain.handle('highlight:list-by-item', (_, feedItemId: string) =>
    handleIPC(() => {
      return highlightService.getHighlightsByItem(feedItemId)
    })
  )

  ipcMain.handle('highlight:list-all', () =>
    handleIPC(() => {
      return highlightService.getAllHighlights()
    })
  )
}
