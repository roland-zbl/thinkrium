import Parser from 'rss-parser'
import { ParsedFeed, RSSItem } from '../types/rss'

// 自訂欄位以抓取更多內容
type CustomFeed = { feedUrl: string }
// CustomItem 繼承 RSSItem 以確保類型兼容，但 rss-parser 的泛型需要明確指定擴充欄位
type CustomItem = RSSItem & {
  'content:encoded': string
  description: string
  'media:content'?: { $: { url: string; medium?: string; type?: string } } | { $: { url: string; medium?: string; type?: string } }[]
  enclosure?: { url: string; type: string }
}

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  timeout: 20000,
  headers: {
    // 完整模擬真實瀏覽器請求
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
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
      ['description', 'description'],
      ['media:content', 'media:content', { keepArray: false }], // rss-parser behavior
      ['enclosure', 'enclosure']
    ]
  }
})

/**
 * 解析 RSS 圖示
 * 策略：feed.image.url -> favicon.ico -> Google Favicon API
 */
export async function resolveIcon(
  feedUrl: string,
  feed: CustomFeed & { image?: { url?: string }; link?: string; items?: CustomItem[] }
): Promise<string | undefined> {
  // 1. 優先使用 feed 內定義的 image
  if (feed.image?.url) {
    return feed.image.url
  }

  // 取得 domain (feed.link or feedUrl)
  let origin = ''
  let domain = ''
  try {
    const targetUrl = feed.link || feedUrl
    const urlObj = new URL(targetUrl)
    origin = urlObj.origin
    domain = urlObj.hostname
  } catch (e) {
    // URL 解析失敗，無法繼續
    return undefined
  }

  // 2. 嘗試 /favicon.ico
  // 這裡我們不實際發送請求去驗證是否存在 (因為可能會有 CORS 或 404)，
  // 但為了更準確，我們可以簡單檢查一下，或者直接回傳讓前端處理。
  // 不過為了與 Google API 區分，我們通常希望有一個確認。
  // 但基於效能，我們這裡先檢查 Google API，或者直接用 Google API 比較穩？
  // 需求順序：feed.image.url -> ${origin}/favicon.ico -> Google Favicon API
  // 為了符合 "非阻塞" 需求，我們不該在這裡 await fetch。
  // 但如果不 await，我們不知道哪個有效。
  // 妥協方案：我們先回傳可能的 URL，或者在這裡做快速檢查 (head request)。
  // 考慮到 Electron後端環境，我們可以做 HEAD request。

  try {
    const faviconUrl = `${origin}/favicon.ico`
    // 簡單驗證 favicon 是否存在 (Timeout 2s)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    // 注意：這裡使用 fetch 需要 node 18+ 或 polyfill (Electron 應該有)
    const response = await fetch(faviconUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    clearTimeout(timeoutId)

    if (response.ok && response.headers.get('content-type')?.includes('image')) {
      return faviconUrl
    }
  } catch (e) {
    // Favicon fetch failed, proceed to next
  }

  // 3. Google Favicon API
  // 這是 fallback，直接回傳 URL，讓前端或後續載入
  // 但我們也希望確認它是否有效？Google API 通常都會回傳一張預設圖 (地球)，所以很難判斷失敗。
  // 但需求說 "如果 Google API 請求失敗...直接顯示灰色預設圖示"。
  // Google API 幾乎不會 HTTP 失敗，但會回傳預設圖。
  // 這裡我們就直接回傳 Google API URL，當作最後手段。
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
}

/**
 * 驗證 RSS 訂閱源是否有效
 */
export async function validateFeed(
  url: string
): Promise<{ valid: boolean; title?: string; icon?: string; error?: string }> {
  console.log(`[RSS Service] Validating: ${url}`)
  try {
    const feed = await parser.parseURL(url)
    console.log(
      `[RSS Service] Validation success: ${feed.title}, items: ${feed.items?.length || 0}`
    )

    const icon = await resolveIcon(url, feed)

    return {
      valid: true,
      title: feed.title,
      icon
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
      items: feed.items.map((item) => {
        // 優先抓取完整內容
        let fullContent =
          item.contentEncoded ||
          item['content:encoded'] ||
          item.content ||
          item.description ||
          item.contentSnippet ||
          ''

        // 嘗試從 enclosure 或 media:content 提取圖片
        let imageUrl: string | undefined

        // 1. Check enclosure
        if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image/')) {
          imageUrl = item.enclosure.url
        }
        // 2. Check media:content
        else if (item['media:content']) {
          // media:content can be an object or array (if multiple sizes)
          // rss-parser with keepArray: false might return single object, but let's be safe
          const media = item['media:content'] as any
          if (Array.isArray(media)) {
             const found = media.find((m: any) => m.$?.medium === 'image' || m.$?.type?.startsWith('image/'))
             if (found && found.$?.url) imageUrl = found.$.url
          } else {
             if (media.$ && (media.$.medium === 'image' || media.$.type?.startsWith('image/') || media.$.url)) {
                // Some feeds just have url attribute on media:content
                imageUrl = media.$.url
             }
          }
        }

        // 如果找到了圖片，且內容中還沒有這張圖片，則將其添加到內容開頭
        if (imageUrl && !fullContent.includes(imageUrl)) {
           // 簡單防呆：確保不是明顯的重複（有些 feed 會在 description 裡放縮圖）
           // 這裡我們直接加在最前面，並設定樣式讓它自適應
           console.log(`[RSS Service] Found extra image for "${item.title}", prepending...`)
           fullContent = `<img src="${imageUrl}" alt="Cover Image" style="display:block; max-width:100%; margin-bottom: 1em;" /><br/>${fullContent}`
        }

        // 記錄內容長度以便調試
        console.log(
          `[RSS Service] Item "${item.title?.substring(0, 30)}..." content length: ${fullContent.length}`
        )

        return {
          guid: item.guid || item.link || item.id,
          title: item.title,
          link: item.link,
          content: fullContent,
          creator: item.creator || item.author || '',
          pubDate: (item.pubDate || item.isoDate) 
            ? new Date(item.pubDate || item.isoDate!).toISOString() 
            : new Date().toISOString()
        }
      })
    }
  } catch (error: any) {
    console.error('[RSS Service] Fetch error:', error.message)
    throw new Error(`抓取失敗: ${error.message}`)
  }
}
