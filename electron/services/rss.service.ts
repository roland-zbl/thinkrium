import Parser from 'rss-parser'
import { ParsedFeed, RSSItem } from '../types/rss'

// 自訂欄位以抓取更多內容
type CustomFeed = { feedUrl: string }
// CustomItem 繼承 RSSItem 以確保類型兼容，但 rss-parser 的泛型需要明確指定擴充欄位
type CustomItem = RSSItem & { 'content:encoded': string; description: string }

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  timeout: 20000,
  headers: {
    // 完整模擬真實瀏覽器請求
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
  },
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['description', 'description']
    ]
  }
})

/**
 * 驗證 RSS 訂閱源是否有效
 */
export async function validateFeed(url: string): Promise<{ valid: boolean; title?: string; error?: string }> {
  console.log(`[RSS Service] Validating: ${url}`)
  try {
    const feed = await parser.parseURL(url)
    console.log(`[RSS Service] Validation success: ${feed.title}, items: ${feed.items?.length || 0}`)
    return {
      valid: true,
      title: feed.title
    }
  } catch (error: any) {
    console.error('[RSS Service] Validation error:', error.message)
    
    // 提供更友善的錯誤訊息
    let friendlyError = error.message || '無法解析該訂閱源'
    if (error.message?.includes('403')) {
      friendlyError = '伺服器拒絕訪問 (403)。該網站可能有反爬蟲保護，建議使用其他 RSS 源。'
    } else if (error.message?.includes('404')) {
      friendlyError = '找不到該 RSS 源 (404)。請確認網址是否正確。'
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      friendlyError = '無法連接到該伺服器。請確認網址是否正確或檢查網路連線。'
    } else if (error.message?.includes('timeout')) {
      friendlyError = '連線逾時。伺服器回應太慢，請稍後再試。'
    }
    
    return {
      valid: false,
      error: friendlyError
    }
  }
}

/**
 * 抓取並解析 RSS 內容
 * 優先使用完整內容 (content:encoded > content > description > contentSnippet)
 */
export async function fetchFeed(url: string): Promise<ParsedFeed> {
  console.log(`[RSS Service] Fetching: ${url}`)
  try {
    const feed = await parser.parseURL(url)
    console.log(`[RSS Service] Fetched ${feed.items?.length || 0} items from ${feed.title}`)
    
    return {
      title: feed.title,
      items: feed.items.map(item => {
        // 優先抓取完整內容
        const fullContent = 
          item.contentEncoded || 
          item['content:encoded'] ||
          item.content || 
          item.description ||
          item.contentSnippet || 
          ''
        
        // 記錄內容長度以便調試
        console.log(`[RSS Service] Item "${item.title?.substring(0, 30)}..." content length: ${fullContent.length}`)
        
        return {
          guid: item.guid || item.link || item.id,
          title: item.title,
          link: item.link,
          content: fullContent,
          creator: item.creator || item.author || '',
          pubDate: item.pubDate || item.isoDate
        }
      })
    }
  } catch (error: any) {
    console.error('[RSS Service] Fetch error:', error.message)
    throw new Error(`抓取失敗: ${error.message}`)
  }
}
