import { describe, it, expect } from 'vitest'
import { opmlService } from '../services/opml.service'
import { Feed } from '../../src/shared/types'

describe('OpmlService', () => {
  describe('parseOpml', () => {
    it('should parse a simple OPML with one feed', () => {
      const opml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <opml version="1.0">
            <head>
                <title>Subscriptions</title>
            </head>
            <body>
                <outline text="TechCrunch" title="TechCrunch" type="rss"
                    xmlUrl="https://techcrunch.com/feed/" htmlUrl="https://techcrunch.com/"/>
            </body>
        </opml>
      `
      const result = opmlService.parseOpml(opml)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        type: 'rss',
        text: 'TechCrunch',
        title: 'TechCrunch',
        xmlUrl: 'https://techcrunch.com/feed/',
        htmlUrl: 'https://techcrunch.com/',
        category: undefined
      })
    })

    it('should parse nested outlines as categories', () => {
      const opml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <opml version="1.0">
            <head>
                <title>Subscriptions</title>
            </head>
            <body>
                <outline text="Tech">
                    <outline text="The Verge" title="The Verge" type="rss"
                        xmlUrl="https://www.theverge.com/rss/index.xml" htmlUrl="https://www.theverge.com/"/>
                </outline>
                <outline text="News">
                     <outline text="BBC" title="BBC" type="rss"
                        xmlUrl="http://feeds.bbci.co.uk/news/rss.xml"/>
                </outline>
            </body>
        </opml>
      `
      const result = opmlService.parseOpml(opml)
      expect(result).toHaveLength(2)

      const techFeed = result.find(f => f.title === 'The Verge')
      expect(techFeed?.category).toBe('Tech')

      const newsFeed = result.find(f => f.title === 'BBC')
      expect(newsFeed?.category).toBe('News')
    })

    it('should handle deeper nesting (taking immediate parent as category)', () => {
         const opml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <opml version="1.0">
            <body>
                <outline text="Root">
                    <outline text="Level 1">
                        <outline text="Feed" type="rss" xmlUrl="http://example.com/rss"/>
                    </outline>
                </outline>
            </body>
        </opml>
      `
      const result = opmlService.parseOpml(opml)
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('Level 1')
    })
  })

  describe('generateOpml', () => {
    it('should generate valid OPML from feeds', () => {
      const feeds: Feed[] = [
        {
          id: '1',
          title: 'Feed 1',
          url: 'http://example.com/1',
          category: 'Tech',
          type: 'rss',
          icon_url: null,
          last_fetched: null,
          fetch_interval: 30,
          created_at: ''
        },
        {
          id: '2',
          title: 'Feed 2',
          url: 'http://example.com/2',
          category: 'Tech', // Same category
          type: 'rss',
          icon_url: null,
          last_fetched: null,
          fetch_interval: 30,
          created_at: ''
        },
        {
          id: '3',
          title: 'Feed 3',
          url: 'http://example.com/3',
          category: 'News',
          type: 'rss',
          icon_url: null,
          last_fetched: null,
          fetch_interval: 30,
          created_at: ''
        },
        {
          id: '4',
          title: 'Feed 4',
          url: 'http://example.com/4',
          category: '未分類', // Should be top level
          type: 'rss',
          icon_url: null,
          last_fetched: null,
          fetch_interval: 30,
          created_at: ''
        }
      ]

      const xml = opmlService.generateOpml(feeds)

      // Basic checks using regex or by parsing it back
      expect(xml).toContain('<outline text="Tech" title="Tech">')
      expect(xml).toContain('<outline text="News" title="News">')

      // Check that Feed 4 is present but NOT inside a category outline named "未分類"
      // (This is a bit tricky to test with simple string matching without parsing,
      // but we can check the structure roughly)

      // Parse it back to verify structure
      const parsed = opmlService.parseOpml(xml)
      expect(parsed).toHaveLength(4)

      const feed1 = parsed.find(f => f.xmlUrl === 'http://example.com/1')
      expect(feed1?.category).toBe('Tech')

      const feed4 = parsed.find(f => f.xmlUrl === 'http://example.com/4')
      // OpmlService.parseOpml treats top-level items as having undefined category
      expect(feed4?.category).toBeUndefined()
    })
  })
})
