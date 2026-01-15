import { ipcMain } from 'electron'
import { projectService } from '../services/project.service'

export function registerProjectIpc() {
  ipcMain.handle('project:create', (_, project) => {
    return projectService.createProject(project)
  })

  ipcMain.handle('project:list', () => {
    return projectService.listProjects()
  })

  ipcMain.handle('project:add-item', (_, projectId, noteId) => {
    return projectService.addItemToProject(projectId, noteId)
  })

  ipcMain.handle('project:get-items', (_, projectId) => {
    return projectService.getProjectItems(projectId)
  })

  ipcMain.handle('project:update-status', (_, id, status) => {
    return projectService.updateProjectStatus(id, status)
  })
}
