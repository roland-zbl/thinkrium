import { Database } from 'better-sqlite3'
import { getDatabase } from '../database'
import { Feed, FeedItem, ItemFilter } from '../../src/renderer/src/modules/feed/types'
import { fetchFeed, validateFeed } from './rss.service'
import { randomUUID } from 'crypto'

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

  addFeed(feed: Omit<Feed, 'created_at'>): void {
    const stmt = this.getDb().prepare(`
      INSERT INTO feeds (id, type, url, title, icon_url, last_fetched, fetch_interval)
      VALUES (@id, @type, @url, @title, @icon_url, @last_fetched, @fetch_interval)
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
}

export const feedService = new FeedService()
