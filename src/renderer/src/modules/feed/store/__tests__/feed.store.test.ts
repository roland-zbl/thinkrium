import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFeedStore } from '../feed.store'
import { act } from '@testing-library/react'

// Mock window.api structure
const mockApi = {
  feed: {
    listFeeds: vi.fn(),
    addFeed: vi.fn(),
    removeFeed: vi.fn(),
    listItems: vi.fn(),
    markAsRead: vi.fn(),
    markAsSaved: vi.fn(),
    markAsUnsaved: vi.fn(),
    validateFeed: vi.fn(),
    fetchFeed: vi.fn(),
    saveQuickNote: vi.fn(),
    importOpml: vi.fn(),
    exportOpml: vi.fn(),
    moveFeedToFolder: vi.fn(),
    search: vi.fn()
  },
  folder: {
    list: vi.fn().mockResolvedValue({ success: true, data: [] }),
    create: vi.fn(),
    rename: vi.fn(),
    delete: vi.fn(),
    move: vi.fn()
  },
  note: {
    save: vi.fn(),
    list: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  highlight: {
    listByItem: vi.fn().mockResolvedValue({ success: true, data: [] }),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    listAll: vi.fn()
  },
  on: vi.fn(),
  off: vi.fn()
}

// Assign to window
Object.defineProperty(window, 'api', {
  value: mockApi,
  writable: true
})

describe('FeedStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset store state before each test
    useFeedStore.setState({
      items: [],
      subscriptions: [],
      folders: [],
      selectedItemId: null,
      activeSubscriptionId: null,
      activeFolderId: null,
      filter: 'all',
      loading: false,
      highlights: new Map()
    })

    // Default successful responses
    mockApi.folder.list.mockResolvedValue({ success: true, data: [] })
    mockApi.highlight.listByItem.mockResolvedValue({ success: true, data: [] })
  })

  describe('Initial State', () => {
    it('should have empty initial state', () => {
      const state = useFeedStore.getState()
      expect(state.items).toEqual([])
      expect(state.subscriptions).toEqual([])
      expect(state.selectedItemId).toBeNull()
      expect(state.activeSubscriptionId).toBeNull()
      expect(state.filter).toBe('all')
      expect(state.loading).toBe(false)
    })
  })

  describe('setFilter', () => {
    it('should update filter state', async () => {
      const { setFilter } = useFeedStore.getState()

      await act(async () => {
        setFilter('unread')
      })

      expect(useFeedStore.getState().filter).toBe('unread')
    })

    it('should call fetchItems when filter changes', async () => {
      const fetchItemsSpy = vi.spyOn(useFeedStore.getState(), 'fetchItems')

      await act(async () => {
        useFeedStore.getState().setFilter('saved')
      })

      expect(fetchItemsSpy).toHaveBeenCalled()
    })
  })

  describe('setActiveSubscription', () => {
    it('should update active subscription and clear selected item', async () => {
      // First set a selected item
      useFeedStore.setState({ selectedItemId: 'some-item' })

      await act(async () => {
        useFeedStore.getState().setActiveSubscription('subscription-1')
      })

      const state = useFeedStore.getState()
      expect(state.activeSubscriptionId).toBe('subscription-1')
      expect(state.selectedItemId).toBeNull()
    })
  })

  describe('selectItem', () => {
    it('should update selected item id', async () => {
      useFeedStore.setState({
        items: [
          {
            id: 'item-1',
            title: 'Test Item',
            source: 'Test',
            date: '2024-01-01',
            status: 'read',
            summary: 'test',
            content: 'test content',
            feed_id: 'feed-1',
            link: 'http://test.com/item-1'
          }
        ]
      })

      await act(async () => {
        await useFeedStore.getState().selectItem('item-1')
      })

      expect(useFeedStore.getState().selectedItemId).toBe('item-1')
    })

    it('should mark unread item as read when selected', async () => {
      mockApi.feed.markAsRead.mockResolvedValue({ success: true, data: undefined })

      useFeedStore.setState({
        items: [
          {
            id: 'item-1',
            title: 'Test Item',
            source: 'Test',
            date: '2024-01-01',
            status: 'unread',
            summary: 'test',
            content: 'test content',
            feed_id: 'feed-1',
            link: 'http://test.com/item-1'
          }
        ]
      })

      await act(async () => {
        await useFeedStore.getState().selectItem('item-1')
      })

      expect(mockApi.feed.markAsRead).toHaveBeenCalledWith('item-1')
    })
  })

  describe('fetchSubscriptions', () => {
    it('should fetch and transform feeds to subscriptions', async () => {
      const mockFeeds = [
        { id: 'feed-1', title: 'Feed 1', url: 'http://example.com/feed1', icon_url: null }
      ]
      mockApi.feed.listFeeds.mockResolvedValue({ success: true, data: mockFeeds })

      await act(async () => {
        await useFeedStore.getState().fetchSubscriptions()
      })

      const subscriptions = useFeedStore.getState().subscriptions
      expect(subscriptions).toHaveLength(1)
      expect(subscriptions[0].id).toBe('feed-1')
      expect(subscriptions[0].name).toBe('Feed 1')
    })
  })

  describe('addFeed', () => {
    it('should validate, add feed, and refresh lists', async () => {
      mockApi.feed.validateFeed.mockResolvedValue({ success: true, data: { valid: true, title: 'New Feed' } })
      mockApi.feed.addFeed.mockResolvedValue({ success: true, data: undefined })
      mockApi.feed.fetchFeed.mockResolvedValue({ success: true, data: { count: 5 } })
      mockApi.feed.listFeeds.mockResolvedValue({ success: true, data: [] }) // for fetchSubscriptions

      await act(async () => {
        await useFeedStore.getState().addFeed('http://example.com/feed')
      })

      expect(mockApi.feed.validateFeed).toHaveBeenCalledWith('http://example.com/feed')
      expect(mockApi.feed.addFeed).toHaveBeenCalled()
      expect(mockApi.feed.fetchFeed).toHaveBeenCalled()
    })

    it('should throw error if feed validation fails', async () => {
      mockApi.feed.validateFeed.mockResolvedValue({
        success: true,
        data: {
          valid: false,
          error: 'Invalid RSS'
        }
      })

      await expect(
        act(async () => {
          await useFeedStore.getState().addFeed('http://invalid.com/feed')
        })
      ).rejects.toThrow('Invalid RSS')
    })
  })

  describe('removeFeed', () => {
    it('should remove feed and associated items from state', async () => {
      mockApi.feed.removeFeed.mockResolvedValue({ success: true, data: undefined })

      useFeedStore.setState({
        subscriptions: [
          { id: 'feed-1', name: 'Feed 1', category: '未分類', unreadCount: 0, url: 'http://...', folder_id: null },
          { id: 'feed-2', name: 'Feed 2', category: '未分類', unreadCount: 0, url: 'http://...', folder_id: null }
        ],
        items: [
          {
            id: 'item-1',
            feed_id: 'feed-1',
            title: 'Item 1',
            source: 'Feed 1',
            date: null,
            status: 'unread',
            summary: '',
            content: null,
            link: null
          },
          {
            id: 'item-2',
            feed_id: 'feed-2',
            title: 'Item 2',
            source: 'Feed 2',
            date: null,
            status: 'unread',
            summary: '',
            content: null,
            link: null
          }
        ]
      })

      await act(async () => {
        await useFeedStore.getState().removeFeed('feed-1')
      })

      const state = useFeedStore.getState()
      expect(state.subscriptions).toHaveLength(1)
      expect(state.subscriptions[0].id).toBe('feed-2')
      expect(state.items).toHaveLength(1)
      expect(state.items[0].feed_id).toBe('feed-2')
    })
  })

  describe('toggleAutoHideRead', () => {
    it('should toggle autoHideRead state', () => {
      const { toggleAutoHideRead } = useFeedStore.getState()

      expect(useFeedStore.getState().autoHideRead).toBe(false)

      act(() => {
        toggleAutoHideRead()
      })

      expect(useFeedStore.getState().autoHideRead).toBe(true)

      act(() => {
        toggleAutoHideRead()
      })

      expect(useFeedStore.getState().autoHideRead).toBe(false)
    })
  })

  describe('saveQuickNote', () => {
    it('should save quick note via IPC and update local state', async () => {
      mockApi.feed.saveQuickNote.mockResolvedValue({ success: true, data: undefined })

      useFeedStore.setState({
        items: [
          {
            id: 'item-1',
            title: 'Item 1',
            source: 'Source',
            date: null,
            status: 'read',
            summary: '',
            content: null,
            feed_id: 'feed-1',
            link: null
          }
        ]
      })

      await act(async () => {
        await useFeedStore.getState().saveQuickNote('item-1', 'My Note')
      })

      expect(mockApi.feed.saveQuickNote).toHaveBeenCalledWith('item-1', 'My Note')
      const item = useFeedStore.getState().items.find((i) => i.id === 'item-1')
      expect(item?.quickNote).toBe('My Note')
    })
  })

  describe('saveItem', () => {
    it('should use quickNote when personalNote is missing', async () => {
      mockApi.note.save.mockResolvedValue({ success: true, data: { id: 'note-1' } })
      mockApi.feed.markAsSaved.mockResolvedValue({ success: true, data: undefined })

      useFeedStore.setState({
        items: [
          {
            id: 'item-with-note',
            title: 'Item With Note',
            source: 'Source',
            date: null,
            status: 'read',
            summary: '',
            content: 'Content',
            feed_id: 'feed-1',
            link: null,
            quickNote: 'Existing Quick Note'
          }
        ]
      })

      await act(async () => {
        await useFeedStore.getState().saveItem('item-with-note')
      })

      expect(mockApi.note.save).toHaveBeenCalledWith(expect.objectContaining({
        personalNote: 'Existing Quick Note'
      }))
    })

    it('should prefer explicit personalNote over quickNote', async () => {
      mockApi.note.save.mockResolvedValue({ success: true, data: { id: 'note-1' } })
      mockApi.feed.markAsSaved.mockResolvedValue({ success: true, data: undefined })

      useFeedStore.setState({
        items: [
          {
            id: 'item-with-note',
            title: 'Item With Note',
            source: 'Source',
            date: null,
            status: 'read',
            summary: '',
            content: 'Content',
            feed_id: 'feed-1',
            link: null,
            quickNote: 'Existing Quick Note'
          }
        ]
      })

      await act(async () => {
        await useFeedStore.getState().saveItem('item-with-note', 'Override Note')
      })

      expect(mockApi.note.save).toHaveBeenCalledWith(expect.objectContaining({
        personalNote: 'Override Note'
      }))
    })
  })
})
