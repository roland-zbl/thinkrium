import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  Bookmark,
  Save,
  ExternalLink,
  X,
  FileText,
  FolderPlus,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { useFeedStore } from '../store/feed.store'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app.store'
import { useToastStore } from '@/stores/toast.store'
import DOMPurify from 'dompurify'
import { HighlightToolbar, HighlightMenu } from './HighlightToolbar'
import { getSelectionOffsets } from '../utils/highlight-utils'
import { useHighlightedContent } from '../hooks/useHighlightedContent'

export const FeedPreview: React.FC = () => {
  const { selectedItemId, items, saveItem, selectItem, saveQuickNote, highlights, createHighlight, updateHighlight, deleteHighlight } = useFeedStore()
  const { addTab } = useAppStore()
  const [quickNote, setQuickNote] = useState('')

  // Highlight State
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(null)
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number; text: string } | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null)
  const [highlightMenuPosition, setHighlightMenuPosition] = useState<{ top: number; left: number } | null>(null)


  const itemIndex = items.findIndex((i) => i.id === selectedItemId)
  const item = items[itemIndex]
  const itemHighlights = item && selectedItemId ? highlights.get(selectedItemId) : []

  // 當選擇的項目改變時，更新 Quick Note
  useEffect(() => {
    if (item) {
      setQuickNote(item.quickNote || '')
      setToolbarPosition(null)
      setSelectionRange(null)
      setActiveHighlightId(null)
      setHighlightMenuPosition(null)
    }
  }, [item?.id, item?.quickNote])

  // 處理導航
  const handlePrev = (): void => {
    if (itemIndex > 0) {
      selectItem(items[itemIndex - 1].id)
    }
  }

  const handleNext = (): void => {
    if (itemIndex < items.length - 1) {
      selectItem(items[itemIndex + 1].id)
    }
  }

  // 淨化 HTML 內容
  const sanitizedContent = useMemo(() => {
    if (!item) return ''
    const contentToSanitize = item.content || item.summary || ''
    // 設定 DOMPurify 允許標籤與屬性，確保圖片、連結等正常顯示
    return DOMPurify.sanitize(contentToSanitize, {
      ADD_TAGS: ['iframe', 'mark'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target', 'style', 'width', 'height', 'data-src', 'data-original', 'class']
    })
  }, [item])

  // Apply highlights
  const contentWithHighlights = useHighlightedContent(sanitizedContent, itemHighlights)

  // Handle Text Selection
  const handleMouseUp = () => {
    if (!contentRef.current) return

    // Allow clicking on existing highlights to open menu
    // We defer to check if a selection was made.
    setTimeout(() => {
      const offsets = getSelectionOffsets(contentRef.current!)
      if (offsets && offsets.text.trim().length > 0) {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          // Check if user is clicking inside an existing highlight?
          // Actually if selection is non-empty, we prefer creation.
          // If selection is empty (click), we handle that via event delegation.

          setSelectionRange(offsets)
          setToolbarPosition({
            top: rect.top,
            left: rect.left + rect.width / 2
          })
          // Close existing menu
          setActiveHighlightId(null)
          setHighlightMenuPosition(null)
          return
        }
      }

      // No valid selection, clear toolbar
      setToolbarPosition(null)
      setSelectionRange(null)
    }, 10)
  }

  // Handle clicks on existing highlights
  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    // Check if clicked on a highlight mark
    if (target.tagName === 'MARK' && target.dataset.highlightId) {
      e.stopPropagation() // Prevent clearing selection if any?
      const id = target.dataset.highlightId
      const rect = target.getBoundingClientRect()
      setActiveHighlightId(id)
      setHighlightMenuPosition({
        top: rect.bottom,
        left: rect.left + rect.width / 2
      })
      setToolbarPosition(null) // Close toolbar if open
    } else {
      // Clicked elsewhere, close menu
      // But only if we didn't just select text (handled by mouseup)
      // MouseUp fires before Click?
      // Let's rely on state.
      // Actually, if we click outside, we should close menu.
      // Don't close immediately if we are selecting text.
      if (!window.getSelection()?.toString()) {
        setActiveHighlightId(null)
        setHighlightMenuPosition(null)
      }
    }
  }

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!item) return
      if (toolbarPosition && selectionRange) {
        if (e.key.toLowerCase() === 'h') {
          e.preventDefault()
          createHighlight(item.id, selectionRange.text, selectionRange.start, selectionRange.end, 'yellow')
          setToolbarPosition(null)
          setSelectionRange(null)
          window.getSelection()?.removeAllRanges()
        }
        if (e.key.toLowerCase() === 'n') {
          // Not easily implementable without opening the UI,
          // or we can auto-create yellow and open note.
          e.preventDefault()
          createHighlight(item.id, selectionRange.text, selectionRange.start, selectionRange.end, 'yellow')
          // We would need to then find the created highlight and open the menu.
          // Since ID is async/random, we might need to wait or predict ID.
          // For now, let's just do simple highlight.
          setToolbarPosition(null)
          setSelectionRange(null)
          window.getSelection()?.removeAllRanges()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [item, toolbarPosition, selectionRange, createHighlight])

  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/40 backdrop-blur">
        <FileText size={64} className="mb-6 opacity-20" />
        <span className="text-base font-medium">選擇一個項目來查看詳細內容</span>
      </div>
    )
  }

  const handleSave = (): void => {
    if (item.status === 'saved') {
      // 如果已保存，再次點擊則開啟編輯
      addTab({
        id: `edit-${item.id}`,
        type: 'editor',
        title: item.title,
        data: { noteId: undefined },
        isDirty: false
      })
    } else {
      // 如果未保存，僅執行保存，並傳入當前速記內容
      saveItem(item.id, quickNote)
    }
  }

  return (
    <div
      className="h-full flex flex-col relative bg-card"
    >
      {/* 工具欄 */}
      <div
        className="h-14 border-b flex items-center justify-between px-4 shrink-0 border-border"
      >
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          <button
            onClick={() => selectItem(null)}
            className="hover:bg-black/5 dark:hover:bg-white/5 p-1.5 rounded transition-colors text-muted-foreground hover:text-foreground shrink-0"
            title="關閉 (ESC)"
          >
            <X size={20} />
          </button>

          <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/50 shrink-0">
            <button
              onClick={handlePrev}
              disabled={itemIndex <= 0}
              className="p-1 hover:bg-background rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-muted-foreground hover:text-foreground"
              title="上一篇 (K)"
            >
              <ChevronUp size={18} />
            </button>
            <div className="w-px h-4 bg-border/50 mx-0.5" />
            <button
              onClick={handleNext}
              disabled={itemIndex >= items.length - 1}
              className="p-1 hover:bg-background rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-muted-foreground hover:text-foreground"
              title="下一篇 (J)"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest truncate ml-2">
            {item.source}
          </span>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => item.link && window.open(item.link, '_blank')}
            className={cn(
              'p-2 hover:text-primary text-muted-foreground transition-colors',
              !item.link && 'opacity-50 cursor-not-allowed'
            )}
            title="在瀏覽器開啟"
            disabled={!item.link}
          >
            <ExternalLink size={20} />
          </button>
          <button
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('open-project-selector', {
                  detail: { itemId: item.id }
                })
              )
            }}
            className="p-2 hover:text-primary text-muted-foreground transition-colors"
            title="加入專案 (P)"
          >
            <FolderPlus size={20} />
          </button>
          {item.status === 'saved' && (
            <button
              onClick={() => unsaveItem(item.id)}
              className="p-2 hover:text-destructive text-muted-foreground transition-colors"
              title="取消保存"
            >
              <Bookmark size={20} className="fill-current" />
            </button>
          )}
          <button
            onClick={handleSave}
            className={cn(
              'flex items-center gap-2 text-xs px-3 py-1.5 rounded transition-colors font-bold whitespace-nowrap',
              item.status === 'saved'
                ? 'bg-black/5 dark:bg-white/10 text-foreground/80 hover:bg-black/10 dark:hover:bg-white/20'
                : 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20'
            )}
          >
            <Bookmark size={16} fill={item.status === 'saved' ? 'currentColor' : 'none'} />
            {item.status === 'saved' ? '編輯筆記' : '保存'}
          </button>
        </div>
      </div>

      {/* 內文區 */}
      <div className="flex-1 overflow-auto p-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 leading-snug text-foreground">{item.title}</h2>
          <div className="text-sm text-muted-foreground mb-8 flex items-center gap-2">
            <span>{item.date ? new Date(item.date).toLocaleString() : ''}</span>
            {item.source && (
              <>
                <span>•</span>
                <span className="font-medium text-primary">{item.source}</span>
              </>
            )}
          </div>

          <div
            ref={contentRef}
            onMouseUp={handleMouseUp}
            onClick={handleContentClick}
            className="prose prose-lg dark:prose-invert max-w-prose mx-auto
              leading-relaxed
              prose-p:my-6
              prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto prose-img:block prose-img:max-w-full
              prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-pre:bg-muted prose-pre:text-muted-foreground prose-pre:border prose-pre:border-border prose-pre:rounded-lg
            "
            dangerouslySetInnerHTML={{ __html: contentWithHighlights }}
          />
        </div>
      </div>

      <HighlightToolbar
        position={toolbarPosition}
        onClose={() => {
          setToolbarPosition(null)
          setSelectionRange(null)
          window.getSelection()?.removeAllRanges()
        }}
        onColorSelect={(color) => {
          if (item && selectionRange) {
            createHighlight(item.id, selectionRange.text, selectionRange.start, selectionRange.end, color)
            setToolbarPosition(null)
            setSelectionRange(null)
            window.getSelection()?.removeAllRanges()
          }
        }}
        onAddNote={() => {
          // Create yellow highlight then open note?
          if (item && selectionRange) {
            // Ideally create and then open editing.
            // For MVP, just create with default yellow.
            createHighlight(item.id, selectionRange.text, selectionRange.start, selectionRange.end, 'yellow')
            setToolbarPosition(null)
            setSelectionRange(null)
            window.getSelection()?.removeAllRanges()
            // TODO: Automatically open menu for the new highlight?
          }
        }}
      />

      {activeHighlightId && (
        <HighlightMenu
          position={highlightMenuPosition}
          note={itemHighlights?.find(h => h.id === activeHighlightId)?.note || null}
          color={itemHighlights?.find(h => h.id === activeHighlightId)?.color || 'yellow'}
          onUpdateColor={(c) => updateHighlight(activeHighlightId, undefined, c)}
          onUpdateNote={(n) => updateHighlight(activeHighlightId, n, undefined)}
          onDelete={() => {
            if (item) deleteHighlight(activeHighlightId, item.id)
            setActiveHighlightId(null)
          }}
          onClose={() => setActiveHighlightId(null)}
        />
      )}

      {/* 速記區 (Quick Note) */}
      <div
        className="p-4 border-t bg-muted/40 backdrop-blur border-border"
      >
        <div className="flex flex-col gap-3 relative max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
              速記 (Quick Note)
            </span>
            <span className="text-xs text-muted-foreground">{quickNote.length} 字</span>
          </div>
          <textarea
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            placeholder="在此輸入速記（此內容將附屬於本篇文章）..."
            className="w-full h-24 bg-black/5 dark:bg-white/5 border border-border rounded-xl p-4 text-base focus:outline-none focus:border-primary/50 transition-colors resize-none no-scrollbar placeholder:text-muted-foreground/60 text-foreground"
          />
          <button
            disabled={!quickNote.trim()}
            onClick={() => {
              if (item && quickNote.trim()) {
                saveQuickNote(item.id, quickNote)
                useToastStore.getState().addToast({
                  type: 'success',
                  title: '速記已暫存'
                })
              }
            }}
            className={cn(
              'absolute bottom-3 right-3 p-2 rounded transition-all',
              quickNote.trim()
                ? 'text-primary hover:bg-primary/10'
                : 'text-muted-foreground opacity-50'
            )}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
