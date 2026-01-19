/// <reference types="vite/client" />
import { Note, DbProject, Feed, FeedItem, ItemFilter, DbNote } from './types'
import { IPCResult } from '@shared/types/ipc'

declare global {
  interface Window {
    api: {
      feed: {
        listFeeds: () => Promise<IPCResult<Feed[]>>
        addFeed: (feed: Partial<Feed>) => Promise<IPCResult<void>>
        removeFeed: (feedId: string) => Promise<IPCResult<void>>
        listItems: (filter: ItemFilter) => Promise<IPCResult<FeedItem[]>>
        markAsRead: (itemId: string) => Promise<IPCResult<void>>
        validateFeed: (url: string) => Promise<IPCResult<{ valid: boolean; title?: string; error?: string }>>
        fetchFeed: (feedId: string) => Promise<IPCResult<{ count: number }>>
        saveQuickNote: (itemId: string, note: string) => Promise<IPCResult<void>>
        importOpml: (filePath: string) => Promise<IPCResult<{ added: number; skipped: number; errors: string[] }>>
        exportOpml: () => Promise<IPCResult<boolean>>
      }
      dialog: {
        openFile: (options: any) => Promise<IPCResult<string | null>>
      }
      settings: {
        get: (key: string) => Promise<IPCResult<string | null>>
        set: (key: string, value: string) => Promise<IPCResult<void>>
        selectDirectory: () => Promise<IPCResult<string | null>>
      }
      note: {
        save: (input: Partial<Note> & { content?: string, sourceUrl?: string, sourceType?: string, sourceItemId?: string }) => Promise<IPCResult<Note>>
        list: (filter?: any) => Promise<IPCResult<DbNote[]>>
        get: (id: string) => Promise<IPCResult<DbNote>>
        update: (id: string, updates: Partial<Note>) => Promise<IPCResult<Note>>
        delete: (id: string) => Promise<IPCResult<void>>
      }
      project: {
        create: (project: Partial<DbProject>) => Promise<IPCResult<void>>
        list: () => Promise<IPCResult<DbProject[]>>
        addItem: (projectId: string, noteId: string) => Promise<IPCResult<void>>
        getItems: (projectId: string) => Promise<IPCResult<any[]>> // Keep any for items as structure is loose/unknown
        updateStatus: (id: string, status: string) => Promise<IPCResult<void>>
      }
      // E2E Testing flag
      isE2ETesting: boolean
    }
  }
}
