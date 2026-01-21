import { StateCreator } from 'zustand'
import { FeedState, FoldersSlice } from '../types'
import { useToastStore } from '@/stores/toast.store'
import { invokeIPC } from '@/utils/ipc'

export const createFoldersSlice: StateCreator<FeedState, [], [], FoldersSlice> = (set, get) => ({
  folders: [],
  activeFolderId: null,

  fetchFolders: async () => {
    try {
      const folders = await invokeIPC(window.api.folder.list(), { showErrorToast: false })
      set({ folders })
    } catch (error) {
      console.error('Failed to fetch folders:', error)
    }
  },

  createFolder: async (name, parentId) => {
    try {
      await invokeIPC(window.api.folder.create(name, parentId), { showErrorToast: false })
      await get().fetchFolders()
      useToastStore.getState().addToast({ type: 'success', title: 'Folder created' })
    } catch (error) {
      console.error(error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to create folder', description: msg })
    }
  },

  renameFolder: async (id, name) => {
    try {
      await invokeIPC(window.api.folder.rename(id, name), { showErrorToast: false })
      await get().fetchFolders()
      useToastStore.getState().addToast({ type: 'success', title: 'Folder renamed' })
    } catch (error) {
      console.error(error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to rename folder', description: msg })
    }
  },

  deleteFolder: async (id) => {
    try {
      await invokeIPC(window.api.folder.delete(id), { showErrorToast: false })
      await get().fetchFolders()
      await get().fetchSubscriptions() // Feeds are moved to root
      useToastStore.getState().addToast({ type: 'success', title: 'Folder deleted' })
    } catch (error) {
      console.error(error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to delete folder', description: msg })
    }
  },

  moveFolder: async (id, newParentId) => {
    try {
      await invokeIPC(window.api.folder.move(id, newParentId), { showErrorToast: false })
      await get().fetchFolders()
    } catch (error) {
      console.error(error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to move folder', description: msg })
    }
  },

  moveFeedToFolder: async (feedId, folderId) => {
    try {
      await invokeIPC(window.api.feed.moveFeedToFolder(feedId, folderId), { showErrorToast: false })
      await get().fetchSubscriptions()
    } catch (error) {
      console.error(error)
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to move feed', description: msg })
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
