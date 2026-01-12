import { session } from 'electron'

/**
 * 設置圖片防盜鏈繞過
 * 為特定網站的圖片請求設置正確的 Referer 頭
 */
export function setupAntiHotlinkBypass(): void {
  // 需要處理的圖片域名和對應的 Referer
  const domainRefererMap: Record<string, string> = {
    'img.gamelook.com.cn': 'http://www.gamelook.com.cn/',
    // 可以在這裡添加更多網站的配置
  }

  // 攔截所有請求，修改 Referer
  session.defaultSession.webRequest.onBeforeSendHeaders(
    {
      urls: ['http://*/*', 'https://*/*']
    },
    (details, callback) => {
      // 從請求 URL 中提取域名
      try {
        const url = new URL(details.url)
        const hostname = url.hostname
        
        // 檢查是否是需要處理的域名
        if (domainRefererMap[hostname]) {
          // 設置正確的 Referer
          details.requestHeaders['Referer'] = domainRefererMap[hostname]
          console.log(`[Anti-Hotlink] Modified Referer for ${hostname}`)
        }
      } catch (e) {
        // 忽略無效的 URL
      }
      
      callback({ requestHeaders: details.requestHeaders })
    }
  )
  
  console.log('[Anti-Hotlink] Bypass configured for:', Object.keys(domainRefererMap).join(', '))
}
