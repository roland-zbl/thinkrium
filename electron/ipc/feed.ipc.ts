import { ipcMain } from 'electron'
import { Feed, FeedItem, ItemFilter } from '@shared/types'
import { feedService } from '../services/feed.service'

/**
 * 初始化 Feed 模組的 IPC 處理器
 */
export function initFeedIPC(): void {
  // --- 訂閱源管理 ---

  // 獲取所有訂閱源
  ipcMain.handle('feed:list', (): Feed[] => {
    return feedService.getAllFeeds()
  })

  // 新增訂閱源
  ipcMain.handle('feed:add', (_, feed: Omit<Feed, 'created_at'> & { category?: string }): void => {
    // 確保 category 存在，如果沒有則使用預設值
    const feedWithCategory = {
      ...feed,
      category: feed.category || '未分類'
    }
    feedService.addFeed(feedWithCategory)
  })

  // 刪除訂閱源
  ipcMain.handle('feed:remove', (_, feedId: string): void => {
    feedService.deleteFeed(feedId)
  })

  // --- 內容項目管理 ---

  // 獲取文章列表
  ipcMain.handle('feed:items:list', (_, filter: ItemFilter = {}): FeedItem[] => {
    return feedService.getFeedItems(filter)
  })

  // 標記為已讀
  ipcMain.handle('feed:items:mark-read', (_, itemId: string): void => {
    feedService.markItemAsRead(itemId)
  })

  // 批量新增文章（供抓取服務使用）
  ipcMain.handle(
    'feed:items:bulk-add',
    (_, items: Omit<FeedItem, 'status' | 'read_at' | 'fetched_at'>[]): void => {
      feedService.addFeedItems(items)
    }
  )

  // --- RSS 抓取服務 ---

  // 驗證訂閱源
  ipcMain.handle('feed:validate', async (_, url: string) => {
    return await feedService.validateFeedUrl(url)
  })

  // 抓取並存入資料庫
  ipcMain.handle('feed:fetch', async (_, feedId: string) => {
    return await feedService.refreshFeed(feedId)
  })
}
