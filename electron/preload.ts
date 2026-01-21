import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  feed: {
    listFeeds: () => ipcRenderer.invoke('feed:list'),
    addFeed: (feed: any) => ipcRenderer.invoke('feed:add', feed),
    removeFeed: (feedId: string) => ipcRenderer.invoke('feed:remove', feedId),
    listItems: (filter: any) => ipcRenderer.invoke('feed:items:list', filter),
    markAsRead: (itemId: string) => ipcRenderer.invoke('feed:items:mark-read', itemId),
    markAsSaved: (itemId: string) => ipcRenderer.invoke('feed:items:mark-saved', itemId),
    markAsUnsaved: (itemId: string) => ipcRenderer.invoke('feed:items:mark-unsaved', itemId),
    validateFeed: (url: string) => ipcRenderer.invoke('feed:validate', url),
    fetchFeed: (feedId: string) => ipcRenderer.invoke('feed:fetch', feedId),
    importOpml: (filePath: string) => ipcRenderer.invoke('feed:import-opml', filePath),
    exportOpml: () => ipcRenderer.invoke('feed:export-opml'),
    moveFeedToFolder: (feedId: string, folderId: string | null) =>
      ipcRenderer.invoke('feed:move-to-folder', { feedId, folderId })
  },
  folder: {
    create: (name: string, parentId?: string) =>
      ipcRenderer.invoke('folder:create', { name, parentId }),
    rename: (id: string, name: string) => ipcRenderer.invoke('folder:rename', { id, name }),
    delete: (id: string) => ipcRenderer.invoke('folder:delete', id),
    move: (id: string, newParentId: string | null) =>
      ipcRenderer.invoke('folder:move', { id, newParentId }),
    list: () => ipcRenderer.invoke('folder:list')
  },
  highlight: {
    create: (data: any) => ipcRenderer.invoke('highlight:create', data),
    update: (data: any) => ipcRenderer.invoke('highlight:update', data),
    delete: (id: string) => ipcRenderer.invoke('highlight:delete', id),
    listByItem: (feedItemId: string) => ipcRenderer.invoke('highlight:list-by-item', feedItemId),
    listAll: () => ipcRenderer.invoke('highlight:list-all')
  },
  dialog: {
    openFile: (options: any) => ipcRenderer.invoke('dialog:openFile', options)
  },
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: string) => ipcRenderer.invoke('settings:set', key, value),
    selectDirectory: () => ipcRenderer.invoke('settings:selectDirectory')
  },
  note: {
    save: (input: any) => ipcRenderer.invoke('note:save', input),
    list: (filter?: any) => ipcRenderer.invoke('note:list', filter),
    get: (id: string) => ipcRenderer.invoke('note:get', id),
    update: (id: string, updates: any) => ipcRenderer.invoke('note:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('note:delete', id)
  },
  project: {
    create: (project: any) => ipcRenderer.invoke('project:create', project),
    list: () => ipcRenderer.invoke('project:list'),
    addItem: (projectId: string, noteId: string) =>
      ipcRenderer.invoke('project:add-item', projectId, noteId),
    getItems: (projectId: string) => ipcRenderer.invoke('project:get-items', projectId),
    updateStatus: (id: string, status: string) =>
      ipcRenderer.invoke('project:update-status', id, status)
  },
  on: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, ...args: any[]) => callback(_event, ...args)
    ipcRenderer.on(channel, subscription)
    return () => ipcRenderer.removeListener(channel, subscription)
  },
  off: (channel: string, callback: (...args: any[]) => void) => ipcRenderer.removeListener(channel, callback),
  // E2E Testing flag - allows renderer to skip setup checks
  isE2ETesting: process.env.E2E_TESTING === 'true'
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
