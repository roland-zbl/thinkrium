export interface RSSItem {
  title?: string
  link?: string
  pubDate?: string
  content?: string
  contentSnippet?: string
  guid?: string
  isoDate?: string
  creator?: string
  // Custom fields from rss-parser or specific feed formats
  contentEncoded?: string
  'content:encoded'?: string
  description?: string
  id?: string
  author?: string
}

export interface ParsedFeedItem {
  guid: string | undefined
  title: string | undefined
  link: string | undefined
  content: string | undefined
  creator: string | undefined
  pubDate: string | undefined
}

export interface ParsedFeed {
  title: string | undefined
  items: ParsedFeedItem[]
}
