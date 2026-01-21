import { BrowserWindow } from 'electron'
import { getDatabase } from '../database'
import { fetchFeed } from './rss.service'
import { Feed } from '../../src/shared/types/feed'
import { randomUUID } from 'crypto'

let schedulerInterval: NodeJS.Timeout | null = null

function sendToAll(channel: string, ...args: any[]) {
  BrowserWindow.getAllWindows().forEach((w) => w.webContents.send(channel, ...args))
}

/**
 * 初始化排程服務
 */
export function initScheduler(): void {
  // 啟動時先執行一次（延遲 10 秒，避免拖慢啟動）
  setTimeout(runScheduledFetch, 10000)

  // 每 15 分鐘執行一次
  schedulerInterval = setInterval(runScheduledFetch, 15 * 60 * 1000)
  console.log('[Scheduler] Background fetch scheduler started (15m interval)')
}

/**
 * 停止排程服務
 */
export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval)
    schedulerInterval = null
  }
}

/**
 * 執行排程抓取
 */
async function runScheduledFetch(): Promise<void> {
  console.log('[Scheduler] Starting background fetch...')
  sendToAll('scheduler:fetch-start')
  const db = getDatabase()

  try {
    // 獲取所有訂閱源
    const feeds = db.prepare('SELECT * FROM feeds').all() as Feed[]

    for (const feed of feeds) {
      // 檢查是否需要抓取 (例如: last_fetched 超過 fetch_interval)
      // 這裡簡單起見，每次都抓取
      await fetchFeedAndSave(db, feed)
    }

    console.log('[Scheduler] Background fetch completed')
  } catch (error) {
    console.error('[Scheduler] Error during background fetch:', error)
  } finally {
    sendToAll('scheduler:fetch-end')
  }
}

async function fetchFeedAndSave(db: any, feed: Feed): Promise<void> {
  try {
    console.log(`[Scheduler] Fetching ${feed.title}...`)
    const result = await fetchFeed(feed.url)

    const items = result.items.map((item) => ({
      id: randomUUID(),
      feed_id: feed.id,
      guid: item.guid,
      title: item.title,
      url: item.link,
      content: item.content,
      author: item.creator,
      published_at: item.pubDate
    }))

    const insert = db.prepare(`
            INSERT OR IGNORE INTO feed_items (id, feed_id, guid, title, url, content, author, published_at)
            VALUES (@id, @feed_id, @guid, @title, @url, @content, @author, @published_at)
        `)

    let insertedCount = 0
    // 安全性備註：資料庫 schema 已對 (feed_id, guid) 設置唯一索引
    // 因此 INSERT OR IGNORE 會自動忽略重複項目，不會造成數據膨脹
    const transaction = db.transaction((items) => {
      for (const item of items) {
        const result = insert.run(item)
        insertedCount += result.changes
      }
    })

    transaction(items)
    console.log(
      `[Scheduler] Fetched ${items.length} items from ${feed.title}, inserted ${insertedCount} new items.`
    )

    // 更新最後抓取時間
    db.prepare('UPDATE feeds SET last_fetched = CURRENT_TIMESTAMP WHERE id = ?').run(feed.id)
  } catch (error) {
    console.error(`[Scheduler] Failed to fetch ${feed.title}:`, error)
  }
}
