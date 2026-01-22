import { StateCreator } from 'zustand'
import { FeedState, FoldersSlice } from '../types'
import { useToastStore } from '@/stores/toast.store'
import { invokeIPC } from '@/utils/ipc'

export const createFoldersSlice: StateCreator<FeedState, [], [], FoldersSlice> = (set, get) => ({
  folders: [],
  activeFolderId: null,

  fetchFolders: async () => {
    try {
      // Fetch: silent=true
      const folders = await invokeIPC(window.api.folder.list(), { silent: true })
      set({ folders })
    } catch {
      // Error handled by invokeIPC
    }
  },

  createFolder: async (name, parentId) => {
    try {
      // invokeIPC handles Toast/Log
      await invokeIPC(window.api.folder.create(name, parentId))
      await get().fetchFolders()
      useToastStore.getState().addToast({ type: 'success', title: 'Folder created' })
    } catch {
       // Error handled by invokeIPC
    }
  },

  renameFolder: async (id, name) => {
    try {
      await invokeIPC(window.api.folder.rename(id, name))
      await get().fetchFolders()
      useToastStore.getState().addToast({ type: 'success', title: 'Folder renamed' })
    } catch {
       // Error handled by invokeIPC
    }
  },

  deleteFolder: async (id) => {
    try {
      await invokeIPC(window.api.folder.delete(id))
      await get().fetchFolders()
      await get().fetchSubscriptions() // Feeds are moved to root
      useToastStore.getState().addToast({ type: 'success', title: 'Folder deleted' })
    } catch {
       // Error handled by invokeIPC
    }
  },

  moveFolder: async (id, newParentId) => {
    try {
      await invokeIPC(window.api.folder.move(id, newParentId))
      await get().fetchFolders()
    } catch {
       // Error handled by invokeIPC
    }
  },

  moveFeedToFolder: async (feedId, folderId) => {
    try {
      await invokeIPC(window.api.feed.moveFeedToFolder(feedId, folderId))
      await get().fetchSubscriptions()
    } catch {
       // Error handled by invokeIPC
    }
  },

  setActiveFolder: (id) => {
    set({
      activeFolderId: id,
      activeSubscriptionId: null,
      selectedItemId: null,
      recentlyReadIds: new Set()
    })
    get().fetchItems()
  }
})
