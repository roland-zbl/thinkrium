import { Database } from 'better-sqlite3'
import { getDatabase } from '../database'
import { Feed, FeedItem, ItemFilter } from '../../src/shared/types/feed'
import { fetchFeed, validateFeed } from './rss.service'
import { randomUUID } from 'crypto'

export interface SearchOptions {
  feedId?: string
  feedIds?: string[]
  limit?: number
  offset?: number
}

export interface SearchResult extends FeedItem {
  title_snippet?: string
  content_snippet?: string
}

export class FeedService {
  private db: Database | null = null

  private getDb(): Database {
    if (!this.db) {
      this.db = getDatabase()
    }
    return this.db
  }

  getAllFeeds(): Feed[] {
    const query = `
      SELECT
        f.*,
        (SELECT COUNT(*) FROM feed_items WHERE feed_id = f.id AND status = 'unread') as unreadCount
      FROM feeds f
      ORDER BY f.created_at DESC
    `
    return this.getDb().prepare(query).all() as Feed[]
  }

  moveFeedToFolder(feedId: string, folderId: string | null): void {
    this.getDb()
      .prepare('UPDATE feeds SET folder_id = ? WHERE id = ?')
      .run(folderId || null, feedId)
  }

  getFeedsByFolder(folderId: string): Feed[] {
    const query = `
      SELECT
        f.*,
        (SELECT COUNT(*) FROM feed_items WHERE feed_id = f.id AND status = 'unread') as unreadCount
      FROM feeds f
      WHERE f.folder_id = ?
      ORDER BY f.created_at DESC
    `
    return this.getDb().prepare(query).all(folderId) as Feed[]
  }

  addFeed(feed: Omit<Feed, 'created_at'>): void {
    const stmt = this.getDb().prepare(`
      INSERT INTO feeds (id, type, url, title, icon_url, category, last_fetched, fetch_interval)
      VALUES (@id, @type, @url, @title, @icon_url, @category, @last_fetched, @fetch_interval)
    `)
    stmt.run(feed)
  }

  deleteFeed(feedId: string): void {
    this.getDb().prepare('DELETE FROM feeds WHERE id = ?').run(feedId)
  }

  getFeedItems(filter: ItemFilter = {}): FeedItem[] {
    let query = 'SELECT * FROM feed_items WHERE 1=1'
    const params: any[] = []

    if (filter.feedId) {
      query += ' AND feed_id = ?'
      params.push(filter.feedId)
    }

    if (filter.feedIds && filter.feedIds.length > 0) {
      const placeholders = filter.feedIds.map(() => '?').join(',')
      query += ` AND feed_id IN (${placeholders})`
      params.push(...filter.feedIds)
    }

    if (filter.status) {
      query += ' AND status = ?'
      params.push(filter.status)
    }

    query += ' ORDER BY published_at DESC'

    if (filter.limit) {
      query += ' LIMIT ?'
      params.push(filter.limit)
    }

    if (filter.offset) {
      query += ' OFFSET ?'
      params.push(filter.offset)
    }

    return this.getDb().prepare(query).all(...params) as FeedItem[]
  }

  markItemAsRead(itemId: string): void {
    this.getDb().prepare(
      `
      UPDATE feed_items
      SET status = 'read', read_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    ).run(itemId)
  }

  markItemAsSaved(itemId: string): void {
    this.getDb().prepare(`
      UPDATE feed_items
      SET status = 'saved', read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
      WHERE id = ?
    `).run(itemId)
  }

  markItemAsUnsaved(itemId: string): void {
    this.getDb().prepare(`
      UPDATE feed_items
      SET status = 'read'
      WHERE id = ?
    `).run(itemId)
  }

  saveQuickNote(itemId: string, note: string): void {
    this.getDb().prepare(
      `
      UPDATE feed_items
      SET quick_note = ?
      WHERE id = ?
    `
    ).run(note, itemId)
  }

  addFeedItems(items: Omit<FeedItem, 'status' | 'read_at' | 'fetched_at'>[]): void {
    const insert = this.getDb().prepare(`
      INSERT OR IGNORE INTO feed_items (id, feed_id, guid, title, url, content, author, published_at)
      VALUES (@id, @feed_id, @guid, @title, @url, @content, @author, @published_at)
    `)

    const transaction = this.getDb().transaction((items) => {
      for (const item of items) insert.run(item)
    })

    transaction(items)
  }

  async validateFeedUrl(url: string) {
    return await validateFeed(url)
  }

  async refreshFeed(feedId: string): Promise<{ count: number }> {
    const db = this.getDb()
    const feed = db.prepare('SELECT * FROM feeds WHERE id = ?').get(feedId) as Feed
    if (!feed) throw new Error('訂閱源不存在')

    console.log(`[FeedService] Fetching feed: ${feed.title} (${feed.url})`)
    const result = await fetchFeed(feed.url)

    const items = result.items.map((item) => ({
      id: randomUUID(),
      feed_id: feedId,
      guid: item.guid || item.link || randomUUID(),
      title: item.title || 'Untitled',
      url: item.link || null,
      content: item.content || null,
      author: item.creator || null,
      published_at: item.pubDate || null
    }))

    this.addFeedItems(items)

    // 更新訂閱源的最後抓取時間
    db.prepare('UPDATE feeds SET last_fetched = CURRENT_TIMESTAMP WHERE id = ?').run(feedId)

    return { count: items.length }
  }

  searchItems(query: string, options: SearchOptions = {}): SearchResult[] {
    // 1. Try FTS Search first
    let results = this.ftsSearch(query, options)

    // 2. Fallback to LIKE if no results and query contains CJK (simple check)
    // This is to handle cases where FTS might fail on certain Chinese phrases if tokenizer isn't perfect
    // or to provide a "fuzzy" fallback.
    // Regex for CJK characters range
    const hasCJK = /[\u4e00-\u9fa5]/.test(query)
    if (results.length === 0 && hasCJK) {
      console.log('[FeedService] FTS returned 0 results for CJK query, falling back to LIKE')
      results = this.likeSearch(query, options)
    }

    return results
  }

  private ftsSearch(query: string, options: SearchOptions): SearchResult[] {
    // FTS5 Query
    let sql = `
      SELECT
        fi.*,
        snippet(feed_items_fts, 0, '<b>', '</b>', '...', 32) as title_snippet,
        snippet(feed_items_fts, 1, '<b>', '</b>', '...', 64) as content_snippet
      FROM feed_items_fts
      JOIN feed_items fi ON feed_items_fts.rowid = fi.rowid
      WHERE feed_items_fts MATCH ?
    `
    const params: any[] = [query]

    // Add scope filters
    if (options.feedId) {
      sql += ' AND fi.feed_id = ?'
      params.push(options.feedId)
    }
    if (options.feedIds && options.feedIds.length > 0) {
      const placeholders = options.feedIds.map(() => '?').join(',')
      sql += ` AND fi.feed_id IN (${placeholders})`
      params.push(...options.feedIds)
    }

    sql += ' ORDER BY rank'

    if (options.limit) {
      sql += ' LIMIT ?'
      params.push(options.limit)
    }
    if (options.offset) {
      sql += ' OFFSET ?'
      params.push(options.offset)
    }

    try {
      return this.getDb().prepare(sql).all(...params) as SearchResult[]
    } catch (error) {
      console.error('[FeedService] FTS search failed:', error)
      return []
    }
  }

  private likeSearch(query: string, options: SearchOptions): SearchResult[] {
    let sql = `
      SELECT fi.*
      FROM feed_items fi
      WHERE (fi.title LIKE ? OR fi.content LIKE ?)
    `
    const likeQuery = `%${query}%`
    const params: any[] = [likeQuery, likeQuery]

    if (options.feedId) {
      sql += ' AND fi.feed_id = ?'
      params.push(options.feedId)
    }
    if (options.feedIds && options.feedIds.length > 0) {
      const placeholders = options.feedIds.map(() => '?').join(',')
      sql += ` AND fi.feed_id IN (${placeholders})`
      params.push(...options.feedIds)
    }

    sql += ' ORDER BY fi.published_at DESC'

    if (options.limit) {
      sql += ' LIMIT ?'
      params.push(options.limit)
    }
    if (options.offset) {
      sql += ' OFFSET ?'
      params.push(options.offset)
    }

    const results = this.getDb().prepare(sql).all(...params) as FeedItem[]

    // For LIKE results, we manually simulate snippets (simple version)
    return results.map(item => {
        // Simple highlight replacer
        const highlight = (text: string | null) => {
            if (!text) return ''
            // Note: This is a simple replace, case sensitivity matches the query roughly
            // For better results we'd need a case-insensitive regex replace
            try {
               return text.replace(new RegExp(query, 'gi'), (match) => `<b>${match}</b>`)
            } catch (e) {
               return text
            }
        }

        return {
            ...item,
            title_snippet: highlight(item.title),
            // Truncate content for snippet
            content_snippet: highlight(item.content?.substring(0, 200) || '')
        }
    })
  }
}

export const feedService = new FeedService()
