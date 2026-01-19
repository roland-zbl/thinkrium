import { ipcMain, dialog } from 'electron'
import { Feed, FeedItem, ItemFilter } from '@shared/types'
import { feedService } from '../services/feed.service'
import { opmlService } from '../services/opml.service'
import { handleIPC } from '../utils/ipc-wrapper'
import { readFileSync, writeFileSync } from 'fs'
import { randomUUID } from 'crypto'

/**
 * 初始化 Feed 模組的 IPC 處理器
 */
export function initFeedIPC(): void {
  // --- OPML Import/Export ---

  ipcMain.handle('feed:import-opml', (_, filePath: string) =>
    handleIPC(() => {
      const content = readFileSync(filePath, 'utf-8')
      const feeds = opmlService.parseOpml(content)
      const result = {
        added: 0,
        skipped: 0,
        errors: [] as string[]
      }

      // Get existing feeds to check for duplicates
      const existingFeeds = feedService.getAllFeeds()
      const existingUrls = new Set(existingFeeds.map((f) => f.url))

      for (const opmlFeed of feeds) {
        try {
          if (existingUrls.has(opmlFeed.xmlUrl)) {
            result.skipped++
            continue
          }

          feedService.addFeed({
            id: randomUUID(),
            type: 'rss',
            url: opmlFeed.xmlUrl,
            title: opmlFeed.title,
            icon_url: null,
            category: opmlFeed.category || '未分類',
            last_fetched: null,
            fetch_interval: 30
          })

          existingUrls.add(opmlFeed.xmlUrl) // Add to set to prevent internal duplicates
          result.added++
        } catch (error) {
          result.errors.push(`Failed to import ${opmlFeed.xmlUrl}: ${error}`)
        }
      }

      return result
    })
  )

  ipcMain.handle('feed:export-opml', () =>
    handleIPC(async () => {
      const feeds = feedService.getAllFeeds()
      const opmlContent = opmlService.generateOpml(feeds)

      const { filePath } = await dialog.showSaveDialog({
        title: 'Export OPML',
        defaultPath: 'subscriptions.opml',
        filters: [{ name: 'OPML Files', extensions: ['opml', 'xml'] }]
      })

      if (filePath) {
        writeFileSync(filePath, opmlContent, 'utf-8')
        return true
      }
      return false
    })
  )

  // --- 訂閱源管理 ---

  // 獲取所有訂閱源
  ipcMain.handle('feed:list', () =>
    handleIPC((): Feed[] => {
      return feedService.getAllFeeds()
    })
  )

  // 新增訂閱源
  ipcMain.handle('feed:add', (_, feed: Omit<Feed, 'created_at'> & { category?: string }) =>
    handleIPC((): void => {
      // 確保 category 存在，如果沒有則使用預設值
      const feedWithCategory = {
        ...feed,
        category: feed.category || '未分類'
      }
      feedService.addFeed(feedWithCategory)
    })
  )

  // 刪除訂閱源
  ipcMain.handle('feed:remove', (_, feedId: string) =>
    handleIPC((): void => {
      feedService.deleteFeed(feedId)
    })
  )

  // 移動訂閱源到資料夾
  ipcMain.handle(
    'feed:move-to-folder',
    (_, { feedId, folderId }: { feedId: string; folderId: string | null }) =>
      handleIPC((): void => {
        feedService.moveFeedToFolder(feedId, folderId)
      })
  )

  // --- 內容項目管理 ---

  // 獲取文章列表
  ipcMain.handle('feed:items:list', (_, filter: ItemFilter = {}) =>
    handleIPC((): FeedItem[] => {
      return feedService.getFeedItems(filter)
    })
  )

  // 標記為已讀
  ipcMain.handle('feed:items:mark-read', (_, itemId: string) =>
    handleIPC((): void => {
      feedService.markItemAsRead(itemId)
    })
  )

  // 保存 Quick Note
  ipcMain.handle('feed:save-quick-note', (_, { itemId, note }: { itemId: string; note: string }) =>
    handleIPC((): void => {
      feedService.saveQuickNote(itemId, note)
    })
  )

  // 批量新增文章（供抓取服務使用）
  ipcMain.handle(
    'feed:items:bulk-add',
    (_, items: Omit<FeedItem, 'status' | 'read_at' | 'fetched_at'>[]) =>
      handleIPC((): void => {
        feedService.addFeedItems(items)
      })
  )

  // --- RSS 抓取服務 ---

  // 驗證訂閱源
  ipcMain.handle('feed:validate', (_, url: string) =>
    handleIPC(async () => {
      return await feedService.validateFeedUrl(url)
    })
  )

  // 抓取並存入資料庫
  ipcMain.handle('feed:fetch', (_, feedId: string) =>
    handleIPC(async () => {
      return await feedService.refreshFeed(feedId)
    })
  )
}
