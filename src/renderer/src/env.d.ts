/// <reference types="vite/client" />
import {
  Note,
  DbProject,
  Feed,
  FeedItem,
  ItemFilter,
  DbNote,
  Folder,
  SearchOptions,
  SearchResult,
  CreateHighlightDTO,
  UpdateHighlightDTO,
  Highlight,
  SaveNoteInput,
  UpdateFeedDTO,
  OpenDialogOptions,
  NoteFilter,
  NoteUpdate,
  ProjectItem
} from '@shared/types'
import { IPCResult } from '@shared/types/ipc'

declare global {
  interface Window {
    api: {
      feed: {
        listFeeds: () => Promise<IPCResult<Feed[]>>
        addFeed: (feed: Partial<Feed>) => Promise<IPCResult<void>>
        removeFeed: (feedId: string) => Promise<IPCResult<void>>
        getFeed: (feedId: string) => Promise<IPCResult<Feed>>
        updateFeed: (id: string, updates: UpdateFeedDTO) => Promise<IPCResult<void>>
        listItems: (filter: ItemFilter) => Promise<IPCResult<FeedItem[]>>
        markAsRead: (itemId: string) => Promise<IPCResult<void>>
        markAsSaved: (itemId: string) => Promise<IPCResult<void>>
        markAsUnsaved: (itemId: string) => Promise<IPCResult<void>>
        validateFeed: (url: string) => Promise<
          IPCResult<{ valid: boolean; title?: string; error?: string; icon?: string }>
        >
        fetchFeed: (feedId: string) => Promise<IPCResult<{ count: number }>>
        saveQuickNote: (itemId: string, note: string) => Promise<IPCResult<void>>
        importOpml: (
          filePath: string
        ) => Promise<IPCResult<{ added: number; skipped: number; errors: string[] }>>
        exportOpml: () => Promise<IPCResult<boolean>>
        moveFeedToFolder: (feedId: string, folderId: string | null) => Promise<IPCResult<void>>
        search: (query: string, options: SearchOptions) => Promise<IPCResult<SearchResult[]>>
      }
      folder: {
        create: (name: string, parentId?: string) => Promise<IPCResult<void>>
        rename: (id: string, name: string) => Promise<IPCResult<void>>
        delete: (id: string) => Promise<IPCResult<void>>
        move: (id: string, newParentId: string | null) => Promise<IPCResult<void>>
        list: () => Promise<IPCResult<Folder[]>>
      }
      highlight: {
        create: (data: CreateHighlightDTO) => Promise<IPCResult<void>>
        update: (data: UpdateHighlightDTO) => Promise<IPCResult<void>>
        delete: (id: string) => Promise<IPCResult<void>>
        listByItem: (feedItemId: string) => Promise<IPCResult<Highlight[]>>
        listAll: () => Promise<IPCResult<Highlight[]>>
      }
      dialog: {
        openFile: (options: OpenDialogOptions) => Promise<IPCResult<string | null>>
      }
      settings: {
        get: (key: string) => Promise<IPCResult<string | null>>
        set: (key: string, value: string) => Promise<IPCResult<void>>
        selectDirectory: () => Promise<IPCResult<string | null>>
      }
      note: {
        save: (input: SaveNoteInput) => Promise<IPCResult<Note>>
        list: (filter?: NoteFilter) => Promise<IPCResult<DbNote[]>>
        get: (id: string) => Promise<IPCResult<DbNote>>
        update: (id: string, updates: NoteUpdate) => Promise<IPCResult<Note>>
        delete: (id: string) => Promise<IPCResult<void>>
        sync: () => Promise<IPCResult<{ removed: number }>>
      }
      project: {
        create: (project: Partial<DbProject>) => Promise<IPCResult<void>>
        list: () => Promise<IPCResult<DbProject[]>>
        addItem: (projectId: string, noteId: string) => Promise<IPCResult<void>>
        getItems: (projectId: string) => Promise<IPCResult<ProjectItem[]>>
        updateStatus: (id: string, status: string) => Promise<IPCResult<void>>
      }
      on: (
        channel: string,
        callback: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void
      ) => () => void
      off: (channel: string, callback: (...args: unknown[]) => void) => void
      // E2E Testing flag
      isE2ETesting: boolean
    }
  }
}
