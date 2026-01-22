import { describe, it, expect } from 'vitest'
import { parseTags, formatNoteDate, parseDbNote, parseFeedItem } from '../transform'
import { DbNote, FeedItem as DbFeedItem, SearchResult } from '@/types'

describe('transform.ts', () => {
  describe('parseTags', () => {
    it('should return empty array for null/undefined', () => {
      expect(parseTags(null)).toEqual([])
      expect(parseTags(undefined)).toEqual([])
    })

    it('should return array if input is array', () => {
      expect(parseTags(['a', 'b'])).toEqual(['a', 'b'])
    })

    it('should parse JSON string array', () => {
      expect(parseTags('["a", "b"]')).toEqual(['a', 'b'])
    })

    it('should return empty array for invalid JSON', () => {
      expect(parseTags('invalid json')).toEqual([])
    })

    it('should return empty array if JSON is not array', () => {
      expect(parseTags('{"a": 1}')).toEqual([])
    })
  })

  describe('formatNoteDate', () => {
    it('should format valid date string', () => {
      // Use specific date
      expect(formatNoteDate('2023-01-01')).toBe('2023-01-01')
      expect(formatNoteDate('2023-01-01T10:00:00Z')).toBe('2023-01-01')
    })

    it('should default to today for null/undefined', () => {
        const today = new Date().toISOString().slice(0, 10)
        expect(formatNoteDate(null)).toBe(today)
        expect(formatNoteDate(undefined)).toBe(today)
    })

    it('should default to today for invalid date', () => {
        const today = new Date().toISOString().slice(0, 10)
        expect(formatNoteDate('invalid')).toBe(today)
    })
  })

  describe('parseDbNote', () => {
    it('should parse DbNote correctly', () => {
      const dbNote: DbNote = {
        id: '1',
        title: 'Test Note',
        content: 'content',
        created_at: '2023-01-01T00:00:00Z',
        tags: '["tag1"]',
        type: 'note'
      }

      const note = parseDbNote(dbNote)
      expect(note.id).toBe('1')
      expect(note.title).toBe('Test Note')
      expect(note.date).toBe('2023-01-01')
      expect(note.tags).toEqual(['tag1'])
    })

    it('should extract quick_note', () => {
        const dbNote: DbNote = {
            id: '1',
            title: 'Test',
            content: 'quick_note: "my note"\nOther content',
            created_at: '2023-01-01'
        }
        const note = parseDbNote(dbNote)
        expect(note.quick_note).toBe('my note')
    })
  })

  describe('parseFeedItem', () => {
    it('should parse DbFeedItem correctly', () => {
        const item: DbFeedItem = {
            id: '1',
            title: 'Title',
            content: '<p>Content</p>',
            published_at: '2023-01-01T12:00:00Z',
            status: 'unread',
            feed_id: 'feed1',
            url: 'http://example.com',
            guid: 'uuid-1',
            fetched_at: '2023-01-01',
            read_at: null,
            author: null
        }

        const feedItem = parseFeedItem(item, 'Source A')
        expect(feedItem.id).toBe('1')
        expect(feedItem.source).toBe('Source A')
        expect(feedItem.status).toBe('unread')
        expect(feedItem.summary).toBe('Content')
    })

    it('should use snippets for SearchResult', () => {
        const item: SearchResult = {
            id: '1',
            title: 'Original Title',
            content: 'Original Content',
            published_at: '2023-01-01T12:00:00Z',
            status: 'unread',
            feed_id: 'feed1',
            url: 'http://example.com',
            title_snippet: '<b>Highlighted</b> Title',
            content_snippet: '<b>Highlighted</b> Content',
            guid: 'uuid-1',
            fetched_at: '2023-01-01',
            read_at: null,
            author: null
        }

        const feedItem = parseFeedItem(item, 'Source A')
        expect(feedItem.title).toBe('<b>Highlighted</b> Title')
        expect(feedItem.summary).toBe('<b>Highlighted</b> Content')
    })
  })
})
