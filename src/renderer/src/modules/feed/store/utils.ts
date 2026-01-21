// Helper: Check if text appears to be Markdown
export function isMarkdown(text: string): boolean {
  if (!text) return false
  // Check for common Markdown patterns that are unlikely in plain text/HTML
  // Specifically focused on the reported issue: Markdown Images
  const hasImage = /!\[.*?\]\(.*?\)/.test(text)
  // Headers (at start of line)
  const hasHeading = /^#{1,6}\s/m.test(text)

  // If it has strong Markdown signals, return true.
  // Note: Standard RSS feeds are HTML. Mixed content is possible but rare.
  // We prioritize Markdown rendering if we see explicit Markdown features
  // that would otherwise render as broken text (like `![]()`).
  return hasImage || hasHeading
}

// Helper: Strip HTML tags and decode entities for clean text summary
export function stripHtml(html: string): string {
  if (!html) return ''
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '')
  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '…')
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim()
  return text
}

// Helper: Extract first image URL from HTML content or Markdown
export function extractFirstImage(content: string): string | undefined {
  if (!content) return undefined

  // Try HTML img tag
  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (htmlMatch?.[1]) return htmlMatch[1]

  // Try Markdown image
  const mdMatch = content.match(/!\[.*?\]\((.*?)\)/)
  if (mdMatch?.[1]) {
    // Check if it has title part "url "title""
    const urlParts = mdMatch[1].split(/\s+/)
    return urlParts[0]
  }

  return undefined
}
