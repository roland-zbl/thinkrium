import { useMemo } from 'react'
import { Highlight } from '@/types'
import { applyHighlightsToHtml } from '../utils/highlight-utils'

export const useHighlightedContent = (html: string | null | undefined, highlights: Highlight[] | undefined) => {
  return useMemo(() => {
    if (!html) return ''
    if (!highlights || highlights.length === 0) return html
    return applyHighlightsToHtml(html, highlights)
  }, [html, highlights])
}
