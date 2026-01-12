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
    validateFeed: (url: string) => ipcRenderer.invoke('feed:validate', url),
    fetchFeed: (feedId: string) => ipcRenderer.invoke('feed:fetch', feedId)
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
  }
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
