import { ipcMain } from 'electron'
import { getDatabase } from '../database'
import { Feed, FeedItem, ItemFilter } from '../../src/renderer/src/types'
import { validateFeed, fetchFeed } from '../services/rss.service'
import { randomUUID } from 'crypto'

/**
 * 初始化 Feed 模組的 IPC 處理器
 */
export function initFeedIPC(): void {
  const db = getDatabase()

  // --- 訂閱源管理 ---

  // 獲取所有訂閱源
  ipcMain.handle('feed:list', (): Feed[] => {
    const query = `
      SELECT
        f.*,
        (SELECT COUNT(*) FROM feed_items WHERE feed_id = f.id AND status = 'unread') as unreadCount
      FROM feeds f
      ORDER BY f.created_at DESC
    `
    return db.prepare(query).all() as Feed[]
  })

  // 新增訂閱源
  ipcMain.handle('feed:add', (_, feed: Omit<Feed, 'created_at'>): void => {
    const stmt = db.prepare(`
      INSERT INTO feeds (id, type, url, title, icon_url, last_fetched, fetch_interval)
      VALUES (@id, @type, @url, @title, @icon_url, @last_fetched, @fetch_interval)
    `)
    stmt.run(feed)
  })

  // 刪除訂閱源
  ipcMain.handle('feed:remove', (_, feedId: string): void => {
    db.prepare('DELETE FROM feeds WHERE id = ?').run(feedId)
  })

  // --- 內容項目管理 ---

  // 獲取文章列表
  ipcMain.handle('feed:items:list', (_, filter: ItemFilter = {}): FeedItem[] => {
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

    return db.prepare(query).all(...params) as FeedItem[]
  })

  // 標記為已讀
  ipcMain.handle('feed:items:mark-read', (_, itemId: string): void => {
    db.prepare(
      `
      UPDATE feed_items 
      SET status = 'read', read_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `
    ).run(itemId)
  })

  // 批量新增文章（供抓取服務使用）
  ipcMain.handle(
    'feed:items:bulk-add',
    (_, items: Omit<FeedItem, 'status' | 'read_at' | 'fetched_at'>[]): void => {
      const insert = db.prepare(`
      INSERT OR IGNORE INTO feed_items (id, feed_id, guid, title, url, content, author, published_at)
      VALUES (@id, @feed_id, @guid, @title, @url, @content, @author, @published_at)
    `)

      const transaction = db.transaction((items) => {
        for (const item of items) insert.run(item)
      })

      transaction(items)
    }
  )

  // --- RSS 抓取服務 ---

  // 驗證訂閱源
  ipcMain.handle('feed:validate', async (_, url: string) => {
    return await validateFeed(url)
  })

  // 抓取並存入資料庫
  ipcMain.handle('feed:fetch', async (_, feedId: string) => {
    const feed = db.prepare('SELECT * FROM feeds WHERE id = ?').get(feedId) as Feed
    if (!feed) throw new Error('訂閱源不存在')

    console.log(`[IPC] Fetching feed: ${feed.title} (${feed.url})`)
    const result = await fetchFeed(feed.url)

    const items = result.items.map((item) => ({
      id: randomUUID(),
      feed_id: feedId,
      guid: item.guid,
      title: item.title,
      url: item.link,
      content: item.content,
      author: item.creator,
      published_at: item.pubDate
    }))

    // 批量插入文章
    const insert = db.prepare(`
      INSERT OR IGNORE INTO feed_items (id, feed_id, guid, title, url, content, author, published_at)
      VALUES (@id, @feed_id, @guid, @title, @url, @content, @author, @published_at)
    `)

    const transaction = db.transaction((items) => {
      for (const item of items) insert.run(item)
    })

    transaction(items)

    // 更新訂閱源的最後抓取時間
    db.prepare('UPDATE feeds SET last_fetched = CURRENT_TIMESTAMP WHERE id = ?').run(feedId)

    return { count: items.length }
  })
}
