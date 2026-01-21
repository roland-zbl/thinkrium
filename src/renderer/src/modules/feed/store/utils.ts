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

// Helper: Extract first image URL from HTML content
export function extractFirstImage(html: string): string | undefined {
  if (!html) return undefined
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match?.[1]
}
