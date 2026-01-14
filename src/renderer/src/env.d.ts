/// <reference types="vite/client" />

interface Window {
  api: {
    feed: {
      listFeeds: () => Promise<any[]>
      addFeed: (feed: any) => Promise<void>
      removeFeed: (feedId: string) => Promise<void>
      listItems: (filter: any) => Promise<any[]>
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
      save: (input: any) => Promise<any>
      list: (filter?: any) => Promise<any[]>
      get: (id: string) => Promise<any>
      update: (id: string, updates: any) => Promise<any>
      delete: (id: string) => Promise<void>
    }
  }
}
