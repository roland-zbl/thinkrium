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
  }
}
