// src/renderer/src/mocks/browser-api.mock.ts
// 瀏覽器環境下的 window.api Mock
// 僅在非 Electron 環境（即瀏覽器直接訪問）時啟用

import { mockSubscriptions, mockFeedItems, mockProjects, mockNotes } from './index'

// 模擬的 Feed 資料狀態
let feedItems = [...mockFeedItems]
let subscriptions = [...mockSubscriptions]

// 模擬的設定儲存
const mockSettings: Record<string, string | null> = {
  'notes.rootDir': '/mock/knowledge-base' // 預設已設定，跳過 SetupDialog
}

export function setupBrowserApiMock(): void {
  // 檢查是否已在 Electron 環境中
  if (window.api) {
    console.log('[Mock] Running in Electron environment, skipping browser mock.')
    return
  }

  console.log('[Mock] Running in browser environment, setting up API mock...')

  const mockApi = {
    feed: {
      listFeeds: async () => {
        console.log('[Mock] feed.listFeeds called')
        return subscriptions.map((sub, idx) => ({
          id: sub.id,
          title: sub.name,
          url: `https://example.com/feed/${idx}`,
          category: sub.category,
          createdAt: new Date().toISOString(),
          lastFetchedAt: new Date().toISOString()
        }))
      },
      listItems: async (_filter: any) => {
        console.log('[Mock] feed.listItems called', _filter)
        return feedItems.map((item) => ({
          id: item.id,
          feedId: 'sub-1',
          title: item.title,
          link: `https://example.com/${item.id}`,
          content: item.content,
          summary: item.summary,
          author: item.source,
          publishedAt: new Date().toISOString(),
          isRead: item.status === 'read',
          isSaved: item.status === 'saved'
        }))
      },
      addFeed: async (feed: any) => {
        console.log('[Mock] feed.addFeed called', feed)
        subscriptions.push({
          id: `sub-${Date.now()}`,
          name: feed.title || 'New Feed',
          category: feed.category || '未分類',
          unreadCount: 0
        })
      },
      removeFeed: async (feedId: string) => {
        console.log('[Mock] feed.removeFeed called', feedId)
        subscriptions = subscriptions.filter((s) => s.id !== feedId)
      },
      fetchFeed: async (feedId: string) => {
        console.log('[Mock] feed.fetchFeed called', feedId)
        return { count: Math.floor(Math.random() * 5) }
      },
      validateFeed: async (url: string) => {
        console.log('[Mock] feed.validateFeed called', url)
        return { valid: true, title: 'Validated Feed' }
      },
      markAsRead: async (itemId: string) => {
        console.log('[Mock] feed.markAsRead called', itemId)
        feedItems = feedItems.map((item) =>
          item.id === itemId ? { ...item, status: 'read' } : item
        )
      }
    },
    settings: {
      get: async (key: string) => {
        console.log('[Mock] settings.get called', key)
        return mockSettings[key] ?? null
      },
      set: async (key: string, value: string) => {
        console.log('[Mock] settings.set called', key, value)
        mockSettings[key] = value
      },
      selectDirectory: async () => {
        console.log('[Mock] settings.selectDirectory called')
        return '/mock/selected/path'
      }
    },
    note: {
      save: async (input: any) => {
        console.log('[Mock] note.save called', input)
        return { id: `note-${Date.now()}`, ...input }
      },
      list: async (_filter?: any) => {
        console.log('[Mock] note.list called', _filter)
        return mockNotes
      },
      get: async (id: string) => {
        console.log('[Mock] note.get called', id)
        return mockNotes.find((n) => n.id === id) ?? null
      },
      update: async (id: string, updates: any) => {
        console.log('[Mock] note.update called', id, updates)
        return { id, ...updates }
      },
      delete: async (id: string) => {
        console.log('[Mock] note.delete called', id)
      }
    },
    project: {
      create: async (project: any) => {
        console.log('[Mock] project.create called', project)
        return { id: `proj-${Date.now()}`, ...project }
      },
      list: async () => {
        console.log('[Mock] project.list called')
        return mockProjects
      },
      addItem: async (projectId: string, noteId: string) => {
        console.log('[Mock] project.addItem called', projectId, noteId)
      },
      getItems: async (projectId: string) => {
        console.log('[Mock] project.getItems called', projectId)
        return mockNotes.filter((n) => n.projects.includes(projectId))
      },
      updateStatus: async (id: string, status: string) => {
        console.log('[Mock] project.updateStatus called', id, status)
      }
    }
  }

  // 注入 window.api
  Object.defineProperty(window, 'api', {
    value: mockApi,
    writable: true,
    configurable: true
  })

  console.log('[Mock] Browser API mock setup complete!')
}
