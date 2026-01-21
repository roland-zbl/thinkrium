import { describe, it, expect } from 'vitest'
import { isMarkdown, extractFirstImage, stripHtml } from './utils'

describe('Feed Store Utils', () => {
  describe('isMarkdown', () => {
    it('should identify markdown images', () => {
      const text = 'Some text followed by ![alt](http://example.com/img.jpg)'
      expect(isMarkdown(text)).toBe(true)
    })

    it('should identify markdown headers', () => {
      const text = '# Header 1\nContent'
      expect(isMarkdown(text)).toBe(true)
    })

    it('should return false for plain HTML', () => {
      const text = '<p>This is <b>HTML</b> content</p>'
      expect(isMarkdown(text)).toBe(false)
    })

    it('should return false for plain text', () => {
      const text = 'Just some plain text without markdown symbols.'
      expect(isMarkdown(text)).toBe(false)
    })
  })

  describe('extractFirstImage', () => {
    it('should extract from HTML img tag', () => {
      const content = '<p>Text</p><img src="http://example.com/img.jpg" alt="test">'
      expect(extractFirstImage(content)).toBe('http://example.com/img.jpg')
    })

    it('should extract from Markdown image', () => {
      const content = 'Text\n![alt](http://example.com/md-img.jpg)'
      expect(extractFirstImage(content)).toBe('http://example.com/md-img.jpg')
    })

    it('should return undefined if no image', () => {
      const content = '<p>No images here</p>'
      expect(extractFirstImage(content)).toBeUndefined()
    })

    it('should handle markdown image with title', () => {
      const content = '![alt](http://example.com/img.jpg "Title")'
      expect(extractFirstImage(content)).toBe('http://example.com/img.jpg')
    })
  })

  describe('stripHtml', () => {
    it('should strip tags', () => {
      expect(stripHtml('<p>Hello <b>World</b></p>')).toBe('Hello World')
    })
  })
})
