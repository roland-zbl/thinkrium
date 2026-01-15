/// <reference types="vite/client" />
import { Note, DbProject, Feed, FeedItem, ItemFilter, DbNote } from './types'

declare global {
  interface Window {
    api: {
      feed: {
        listFeeds: () => Promise<Feed[]>
        addFeed: (feed: Partial<Feed>) => Promise<void>
        removeFeed: (feedId: string) => Promise<void>
        listItems: (filter: ItemFilter) => Promise<FeedItem[]>
        markAsRead: (itemId: string) => Promise<void>
        validateFeed: (url: string) => Promise<{ valid: boolean; title?: string; error?: string }>
        fetchFeed: (feedId: string) => Promise<{ count: number }>
      }
      settings: {
        get: (key: string) => Promise<string | null>
        set: (key: string, value: string) => Promise<void>
        selectDirectory: () => Promise<string | null>
      }
      note: {
        save: (input: Partial<Note> & { content?: string, sourceUrl?: string, sourceType?: string, sourceItemId?: string }) => Promise<Note>
        list: (filter?: any) => Promise<DbNote[]>
        get: (id: string) => Promise<DbNote>
        update: (id: string, updates: Partial<Note>) => Promise<Note>
        delete: (id: string) => Promise<void>
      }
      project: {
        create: (project: Partial<DbProject>) => Promise<void>
        list: () => Promise<DbProject[]>
        addItem: (projectId: string, noteId: string) => Promise<void>
        getItems: (projectId: string) => Promise<any[]> // Keep any for items as structure is loose/unknown
        updateStatus: (id: string, status: string) => Promise<void>
      }
    }
  }
}
