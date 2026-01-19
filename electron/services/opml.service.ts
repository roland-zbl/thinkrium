import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import { Feed } from '@shared/types'
import { OpmlFeed, OpmlExport, OpmlOutline } from '../types/opml'

export class OpmlService {
  /**
   * Parse OPML content into a flat list of feeds
   */
  parseOpml(content: string): OpmlFeed[] {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      isArray: (name) => name === 'outline' // Ensure 'outline' is always parsed as array
    })

    const result = parser.parse(content)
    const feeds: OpmlFeed[] = []

    if (!result.opml || !result.opml.body) {
      throw new Error('Invalid OPML format')
    }

    // Handle cases where outline is not an array (single feed) or undefined
    let outlines = []
    if (result.opml && result.opml.body && result.opml.body.outline) {
       outlines = Array.isArray(result.opml.body.outline)
        ? result.opml.body.outline
        : [result.opml.body.outline]
    }

    const processOutline = (outline: any, category?: string) => {
      // If outline has type="rss", it's a feed
      if (outline.type === 'rss' && outline.xmlUrl) {
        feeds.push({
          type: 'rss',
          text: outline.text || outline.title || '',
          title: outline.title || outline.text || '',
          xmlUrl: outline.xmlUrl,
          htmlUrl: outline.htmlUrl,
          category: category
        })
      }

      // Check for nested outlines regardless of whether the current node is a feed or not
      // (Some OPML files might have mixed content or folders that also have attributes)
      if (outline.outline) {
        // If it has children, it might be a category (folder)
        // The category name is the text of the current outline, ONLY if the current outline is NOT a feed itself
        // (Though typically feeds don't have children)

        let newCategory = category
        if (!outline.type || outline.type !== 'rss') {
             newCategory = outline.text || outline.title
        }

        const children = Array.isArray(outline.outline)
          ? outline.outline
          : [outline.outline]

        children.forEach((child: any) => processOutline(child, newCategory))
      }
    }

    outlines.forEach((outline: any) => processOutline(outline))
    return feeds
  }

  /**
   * Generate OPML string from list of feeds
   */
  generateOpml(feeds: Feed[]): string {
    // Group feeds by category
    const feedsByCategory: Record<string, Feed[]> = {}
    const uncategorizedFeeds: Feed[] = []

    feeds.forEach(feed => {
      if (feed.category && feed.category !== '未分類') {
        if (!feedsByCategory[feed.category]) {
          feedsByCategory[feed.category] = []
        }
        feedsByCategory[feed.category].push(feed)
      } else {
        uncategorizedFeeds.push(feed)
      }
    })

    const outlines: OpmlOutline[] = []

    // Process categorized feeds
    for (const [category, categoryFeeds] of Object.entries(feedsByCategory)) {
      outlines.push({
        text: category,
        title: category,
        outline: categoryFeeds.map(feed => ({
          text: feed.title || feed.url,
          title: feed.title || feed.url,
          type: 'rss',
          xmlUrl: feed.url,
          htmlUrl: feed.url
        }))
      })
    }

    // Process uncategorized feeds
    uncategorizedFeeds.forEach(feed => {
      outlines.push({
        text: feed.title || feed.url,
        title: feed.title || feed.url,
        type: 'rss',
        xmlUrl: feed.url,
        htmlUrl: feed.url
      })
    })

    const opml: OpmlExport = {
      head: {
        title: 'Thinkrium Subscriptions',
        dateCreated: new Date().toUTCString()
      },
      body: {
        outline: outlines
      }
    }

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      format: true
    })

    const xmlContent = builder.build({
      '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8'
      },
      opml: {
        '@_version': '2.0',
        head: opml.head,
        body: {
          outline: opml.body.outline
        }
      }
    })

    return xmlContent
  }
}

export const opmlService = new OpmlService()
