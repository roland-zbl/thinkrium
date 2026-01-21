import TurndownService from 'turndown'

export const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
})

turndown.addRule('img', {
  filter: 'img',
  replacement: (_content, node) => {
    const img = node as HTMLImageElement
    const alt = (img.alt || '').replace(/\[/g, '\\[').replace(/\]/g, '\\]')
    const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-original') || ''
    const title = img.title || ''
    
    // Skip images without src
    if (!src) return ''

    // Construct markdown
    // Ensure URL is properly encoded to avoid breaking markdown (e.g. spaces)
    const cleanSrc = src.trim().replace(/\s/g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29')
    
    const result = '![' + alt + '](' + cleanSrc + (title ? ' "' + title.trim() + '"' : '') + ')'
    console.log('[Turndown] Generated image:', result)
    return result
  }
})
