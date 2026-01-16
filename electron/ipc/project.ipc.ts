import { ipcMain } from 'electron'
import { projectService } from '../services/project.service'
import { handleIPC } from '../utils/ipc-wrapper'

export function initProjectIPC() {
  ipcMain.handle('project:create', (_, project) =>
    handleIPC(() => {
      return projectService.createProject(project)
    })
  )

  ipcMain.handle('project:list', () =>
    handleIPC(() => {
      return projectService.listProjects()
    })
  )

  ipcMain.handle('project:add-item', (_, projectId, noteId) =>
    handleIPC(() => {
      return projectService.addItemToProject(projectId, noteId)
    })
  )

  ipcMain.handle('project:get-items', (_, projectId) =>
    handleIPC(() => {
      return projectService.getProjectItems(projectId)
    })
  )

  ipcMain.handle('project:update-status', (_, id, status) =>
    handleIPC(() => {
      return projectService.updateProjectStatus(id, status)
    })
  )
}
