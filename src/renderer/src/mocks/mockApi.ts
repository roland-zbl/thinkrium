// src/renderer/src/mocks/mockApi.ts
// 當在瀏覽器環境（非 Electron）運行時提供 Mock API

import { mockSubscriptions, mockFeedItems, mockProjects, mockNotes } from './index'

// 模擬延遲以更真實地模擬 API 行為
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// In-memory state for mock data
let subscriptions = [...mockSubscriptions]
let feedItems = [...mockFeedItems]
let projects = [...mockProjects]
let notes = [...mockNotes]
let settings: Record<string, string> = {
  'notes.rootDir': '/mock/notes',
  'user.name': 'Mock User'
}

const success = <T>(data: T) => ({ success: true, data })
const fail = (message: string) => ({ success: false, error: { message } })

export const mockApi = {
  feed: {
    listFeeds: async () => {
      await delay(100)
      return success(subscriptions.map(s => ({
        id: s.id,
        title: s.name,
        url: `https://example.com/${s.id}/feed.xml`,
        icon_url: null,
        unreadCount: s.unreadCount
      })))
    },
    addFeed: async (feed: any) => {
      await delay(300)
      const newSub = {
        id: feed.id || `sub-${Date.now()}`,
        name: feed.title,
        category: '未分類',
        unreadCount: 0
      }
      subscriptions.push(newSub)
      console.log('[MockAPI] Feed added:', newSub)
      return success(undefined)
    },
    removeFeed: async (feedId: string) => {
      await delay(100)
      subscriptions = subscriptions.filter(s => s.id !== feedId)
      console.log('[MockAPI] Feed removed:', feedId)
      return success(undefined)
    },
    listItems: async (filter: any) => {
      await delay(100)
      let items = feedItems.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        published_at: item.date,
        status: item.status as 'unread' | 'read' | 'saved',
        feed_id: subscriptions.find(s => s.name === item.source)?.id || 'unknown',
        url: `https://example.com/item/${item.id}`,
        quick_note: null
      }))
      
      if (filter?.feedId) {
        items = items.filter(i => i.feed_id === filter.feedId)
      }
      if (filter?.status) {
        items = items.filter(i => i.status === filter.status)
      }
      return success(items)
    },
    markAsRead: async (itemId: string) => {
      await delay(50)
      const item = feedItems.find(i => i.id === itemId)
      if (item) {
        item.status = 'read'
      }
      console.log('[MockAPI] Item marked as read:', itemId)
      return success(undefined)
    },
    validateFeed: async (url: string) => {
      await delay(500)
      // 模擬驗證成功
      console.log('[MockAPI] Validating feed:', url)
      try {
        const hostname = new URL(url).hostname
        return success({ valid: true, title: `Feed from ${hostname}`, icon: `https://www.google.com/s2/favicons?domain=${hostname}` })
      } catch {
        return success({ valid: true, title: 'Valid Feed' })
      }
    },
    getFeed: async (feedId: string) => {
      await delay(50)
      const feed = subscriptions.find(s => s.id === feedId)
      if (feed) {
        return success({
          id: feed.id,
          title: feed.name,
          url: `https://example.com/${feed.id}/feed.xml`,
          icon_url: null,
          folder_id: null,
          unreadCount: feed.unreadCount
        })
      }
      return fail('Feed not found')
    },
    updateFeed: async (id: string, updates: any) => {
      await delay(100)
      const feed = subscriptions.find(s => s.id === id)
      if (feed) {
        if (updates.title) feed.name = updates.title
        console.log('[MockAPI] Feed updated:', id, updates)
        return success(undefined)
      }
      return fail('Feed not found')
    },
    fetchFeed: async (feedId: string) => {
      await delay(200)
      console.log('[MockAPI] Fetching feed:', feedId)
      return success({ count: Math.floor(Math.random() * 10) })
    },
    saveQuickNote: async (_itemId: string, _note: string) => {
        await delay(100)
        return success(undefined)
    },
    importOpml: async () => success({ added: 0, skipped: 0, errors: [] }),
    exportOpml: async () => success(true),
    moveFeedToFolder: async () => success(undefined),
    search: async () => success([])
  },
  settings: {
    get: async (key: string) => {
      await delay(50)
      return success(settings[key] || null)
    },
    set: async (key: string, value: string) => {
      await delay(50)
      settings[key] = value
      console.log('[MockAPI] Setting saved:', key, value)
      return success(undefined)
    },
    selectDirectory: async () => {
      await delay(100)
      // 模擬選擇目錄
      return success('/mock/selected/directory')
    }
  },
  note: {
    save: async (input: any) => {
      await delay(200)
      const newNote = {
        id: `note-${Date.now()}`,
        title: input.title,
        date: new Date().toISOString().split('T')[0],
        type: 'note',
        projects: [],
        tags: input.tags || [],
        created_at: new Date().toISOString() // Ensure created_at is present
      }
      notes.push(newNote)
      console.log('[MockAPI] Note saved:', newNote)
      return success(newNote)
    },
    list: async (_filter?: any) => {
      await delay(100)
      return success(notes.map(n => ({
        id: n.id,
        title: n.title,
        created_at: n.date,
        updated_at: n.date,
        tags: JSON.stringify(n.tags),
        source_type: n.type
      })))
    },
    get: async (id: string) => {
      await delay(50)
      const note = notes.find(n => n.id === id)
      if (note) {
        return success({
          id: note.id,
          title: note.title,
          content: '# ' + note.title + '\n\n這是 Mock 內容。',
          created_at: note.date,
          updated_at: note.date,
          tags: JSON.stringify(note.tags)
        })
      }
      return fail('Not found')
    },
    update: async (id: string, updates: any) => {
      await delay(100)
      const note = notes.find(n => n.id === id)
      if (note) {
        Object.assign(note, updates)
        console.log('[MockAPI] Note updated:', id, updates)
        return success(note)
      }
      return fail('Not found')
    },
    delete: async (id: string) => {
      await delay(100)
      notes = notes.filter(n => n.id !== id)
      console.log('[MockAPI] Note deleted:', id)
      return success(undefined)
    }
  },
  project: {
    create: async (project: any) => {
      await delay(200)
      const newProject = {
        id: project.id || `proj-${Date.now()}`,
        title: project.title,
        status: project.status || 'active',
        targetDate: project.target_date,
        materialCount: 0,
        deliverableCount: 0,
        notes: ''
      }
      projects.push(newProject)
      console.log('[MockAPI] Project created:', newProject)
      return success(newProject)
    },
    list: async () => {
      await delay(100)
      return success(projects.map(p => ({
        id: p.id,
        title: p.title,
        status: p.status,
        target_date: p.targetDate,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        materialCount: p.materialCount,
        deliverableCount: p.deliverableCount
      })))
    },
    addItem: async (projectId: string, noteId: string) => {
      await delay(100)
      console.log('[MockAPI] Item added to project:', projectId, noteId)
      return success(undefined)
    },
    getItems: async (projectId: string) => {
      await delay(100)
      console.log('[MockAPI] Getting items for project:', projectId)
      const project = projects.find(p => p.id === projectId)
      if (!project) return success([])

      // Filter notes that belong to this project
      // mockNotes structure has `projects: string[]` (array of titles)
      // So we match project.title
      return success(notes.filter(n => n.projects && n.projects.includes(project.title)).map(n => ({
        id: n.id,
        title: n.title,
        content: '# Mock Content',
        created_at: n.date,
        updated_at: n.date,
        added_at: new Date().toISOString(), // Mock added_at for ProjectItem
        source_type: n.type,
        type: n.type,
        tags: n.tags
      })))
    },
    updateStatus: async (id: string, status: string) => {
      await delay(100)
      const project = projects.find(p => p.id === id)
      if (project) {
        project.status = status as any
        console.log('[MockAPI] Project status updated:', id, status)
      }
      return success(undefined)
    }
  },
  highlight: {
    create: async (_data: any) => { await delay(100); return success(undefined) },
    update: async (_data: any) => { await delay(100); return success(undefined) },
    delete: async (_id: string) => { await delay(100); return success(undefined) },
    listByItem: async (_itemId: string) => {
        await delay(100);
        return success([])
    },
    listAll: async () => { await delay(100); return success([]) }
  },
  folder: {
      create: async () => { await delay(100); return success(undefined) },
      rename: async () => { await delay(100); return success(undefined) },
      delete: async () => { await delay(100); return success(undefined) },
      move: async () => { await delay(100); return success(undefined) },
      list: async () => {
        await delay(100);
        // Mock folders
        return success([
            { id: 'f1', name: 'Mock Folder', parent_id: null, position: 0, created_at: new Date().toISOString() }
        ])
      }
  },
  dialog: {
      openFile: async () => success(null)
  }
}

/**
 * 初始化 Mock API
 * 當 window.api 不存在時（非 Electron 環境），自動注入 mock
 */
export function initMockApi(): void {
  if (typeof window !== 'undefined' && !window.api) {
    console.log('[MockAPI] Electron API not found, injecting mock API...')
    ;(window as any).api = mockApi
    // Inject flag for setup
    ;(window as any).api.isE2ETesting = true
    console.log('[MockAPI] Mock API injected successfully!')
  }
}
