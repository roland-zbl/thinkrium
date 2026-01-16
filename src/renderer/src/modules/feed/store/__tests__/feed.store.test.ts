import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFeedStore } from '../feed.store'
import { act } from '@testing-library/react'

describe('FeedStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useFeedStore.setState({
      items: [],
      subscriptions: [],
      selectedItemId: null,
      activeSubscriptionId: null,
      filter: 'all',
      loading: false
    })
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
      const mockMarkAsRead = vi.fn().mockResolvedValue({ success: true, data: undefined })
      window.api.feed.markAsRead = mockMarkAsRead

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

      expect(mockMarkAsRead).toHaveBeenCalledWith('item-1')
    })
  })

  describe('fetchSubscriptions', () => {
    it('should fetch and transform feeds to subscriptions', async () => {
      const mockFeeds = [
        { id: 'feed-1', title: 'Feed 1', url: 'http://example.com/feed1', icon_url: null }
      ]
      window.api.feed.listFeeds = vi.fn().mockResolvedValue({ success: true, data: mockFeeds })

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
      const mockValidate = vi.fn().mockResolvedValue({ success: true, data: { valid: true, title: 'New Feed' } })
      const mockAddFeed = vi.fn().mockResolvedValue({ success: true, data: undefined })
      const mockFetchFeed = vi.fn().mockResolvedValue({ success: true, data: { count: 5 } })

      window.api.feed.validateFeed = mockValidate
      window.api.feed.addFeed = mockAddFeed
      window.api.feed.fetchFeed = mockFetchFeed

      await act(async () => {
        await useFeedStore.getState().addFeed('http://example.com/feed')
      })

      expect(mockValidate).toHaveBeenCalledWith('http://example.com/feed')
      expect(mockAddFeed).toHaveBeenCalled()
      expect(mockFetchFeed).toHaveBeenCalled()
    })

    it('should throw error if feed validation fails', async () => {
      // Logic for validation failure:
      // Case 1: IPC success, but valid=false.
      window.api.feed.validateFeed = vi.fn().mockResolvedValue({
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
      window.api.feed.removeFeed = vi.fn().mockResolvedValue({ success: true, data: undefined })

      useFeedStore.setState({
        subscriptions: [
          { id: 'feed-1', name: 'Feed 1', category: '未分類', unreadCount: 0, url: 'http://...' },
          { id: 'feed-2', name: 'Feed 2', category: '未分類', unreadCount: 0, url: 'http://...' }
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
})
