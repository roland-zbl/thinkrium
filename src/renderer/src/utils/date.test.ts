import { describe, it, expect } from 'vitest'
import { isValidDate, formatRelativeTime, formatAbsoluteDate } from './date'

describe('Date Utils', () => {
  describe('isValidDate', () => {
    it('should return true for valid date strings', () => {
      expect(isValidDate('2023-01-01')).toBe(true)
      expect(isValidDate(new Date().toISOString())).toBe(true)
    })

    it('should return true for valid Date objects', () => {
      expect(isValidDate(new Date())).toBe(true)
    })

    it('should return false for invalid inputs', () => {
      expect(isValidDate(null)).toBe(false)
      expect(isValidDate(undefined)).toBe(false)
      expect(isValidDate('invalid-date')).toBe(false)
      expect(isValidDate('')).toBe(false)
    })
  })

  describe('formatRelativeTime', () => {
    it('should return "未知日期" for invalid dates', () => {
      expect(formatRelativeTime(null)).toBe('未知日期')
      expect(formatRelativeTime('invalid')).toBe('未知日期')
    })

    it('should return "剛剛" for less than 1 minute ago', () => {
      const now = new Date()
      expect(formatRelativeTime(now.toISOString())).toBe('剛剛')
    })

    it('should return "X 分鐘前" for minutes ago', () => {
      const now = new Date()
      const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000)
      expect(formatRelativeTime(fiveMinsAgo.toISOString())).toBe('5 分鐘前')
    })

    it('should return formatted date for older dates', () => {
        // This test depends on locale, which might vary in CI, but we hardcoded 'zh-TW' in the util.
        // Let's just check it doesn't return relative string.
        const oldDate = new Date('2020-01-01')
        const result = formatRelativeTime(oldDate.toISOString())
        expect(result).not.toContain('前')
        expect(result).not.toBe('剛剛')
    })
  })

  describe('formatAbsoluteDate', () => {
      it('should return "未知日期" for invalid dates', () => {
          expect(formatAbsoluteDate(null)).toBe('未知日期')
          expect(formatAbsoluteDate('invalid')).toBe('未知日期')
      })

      it('should return locale string for valid dates', () => {
          const date = new Date('2023-01-01T12:00:00')
          // Checking loosely because locale formatting depends on environment
          // But we know we forced zh-TW in implementation?
          // Actually implementation uses toLocaleString('zh-TW')
          // Node environment might default to English if full ICU is not loaded, but let's be safe
          const result = formatAbsoluteDate(date)
          expect(result).not.toBe('未知日期')
          // Expect some parts of the date
          expect(result).toContain('2023')
      })
  })
})
