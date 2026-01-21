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
      await invokeIPC(window.api.folder.create(name, parentId))
      await get().fetchFolders()
      useToastStore.getState().addToast({ type: 'success', title: 'Folder created' })
    } catch (error) {
      console.error(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to create folder' })
    }
  },

  renameFolder: async (id, name) => {
    try {
      await invokeIPC(window.api.folder.rename(id, name))
      await get().fetchFolders()
      useToastStore.getState().addToast({ type: 'success', title: 'Folder renamed' })
    } catch (error) {
      console.error(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to rename folder' })
    }
  },

  deleteFolder: async (id) => {
    try {
      await invokeIPC(window.api.folder.delete(id))
      await get().fetchFolders()
      await get().fetchSubscriptions() // Feeds are moved to root
      useToastStore.getState().addToast({ type: 'success', title: 'Folder deleted' })
    } catch (error) {
      console.error(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to delete folder' })
    }
  },

  moveFolder: async (id, newParentId) => {
    try {
      await invokeIPC(window.api.folder.move(id, newParentId))
      await get().fetchFolders()
    } catch (error) {
      console.error(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to move folder' })
    }
  },

  moveFeedToFolder: async (feedId, folderId) => {
    try {
      await invokeIPC(window.api.feed.moveFeedToFolder(feedId, folderId))
      await get().fetchSubscriptions()
    } catch (error) {
      console.error(error)
      useToastStore.getState().addToast({ type: 'error', title: 'Failed to move feed' })
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
