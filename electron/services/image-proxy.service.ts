import { protocol, net } from 'electron'

/**
 * 註冊自定義協議用於代理圖片請求
 * 使用方式: image-proxy://img.gamelook.com.cn/2025/12/CJFH8.jpg
 */
export function registerImageProxyProtocol(): void {
  // 在 app ready 之前註冊協議權限
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'image-proxy',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true
      }
    }
  ])
}

/**
 * 在 app ready 之後處理協議請求
 */
export function handleImageProxyProtocol(): void {
  protocol.handle('image-proxy', async (request) => {
    try {
      // 從 URL 中提取原始圖片地址
      // image-proxy://img.gamelook.com.cn/2025/12/CJFH8.jpg
      const originalUrl = request.url.replace('image-proxy://', 'http://')

      console.log('[Image Proxy] Fetching:', originalUrl)

      // 從原始 URL 中提取域名作為 Referer
      const urlObj = new URL(originalUrl)
      const referer = `${urlObj.protocol}//${urlObj.host}/`

      // 使用 net.fetch 請求圖片，設置正確的 Referer
      const response = await net.fetch(originalUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: referer,
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      })

      if (!response.ok) {
        console.error('[Image Proxy] Failed:', response.status, response.statusText)
        // 返回一個透明 1x1 PNG 作為佔位圖
        return new Response(null, { status: response.status })
      }

      console.log('[Image Proxy] Success:', originalUrl)
      return response
    } catch (error) {
      console.error('[Image Proxy] Error:', error)
      return new Response(null, { status: 500 })
    }
  })
}
