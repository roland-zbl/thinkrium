import React, { useState, useMemo } from 'react'
import {
  Bookmark,
  Send,
  ExternalLink,
  X,
  FileText,
  FolderPlus,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { useFeedStore } from '../store/feed.store'
import { tokens } from '../../../styles/tokens'
import { cn } from '../../../lib/utils'
import { useAppStore } from '../../../stores/app.store'
import DOMPurify from 'dompurify'

export const FeedPreview: React.FC = () => {
  const { selectedItemId, items, saveItem, selectItem } = useFeedStore()
  const { addTab } = useAppStore()
  const [quickNote, setQuickNote] = useState('')

  const itemIndex = items.findIndex((i) => i.id === selectedItemId)
  const item = items[itemIndex]

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
      ADD_TAGS: ['iframe'], // 允許嵌入影片等
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target']
    })
  }, [item])

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
      // 如果未保存，僅執行保存，不跳轉
      saveItem(item.id)
    }
  }

  return (
    <div
      className="h-full flex flex-col relative"
      style={{ backgroundColor: tokens.colors.bgElevated }}
    >
      {/* 工具欄 */}
      <div
        className="h-14 border-b flex items-center justify-between px-4 shrink-0"
        style={{ borderColor: tokens.colors.bgSubtle }}
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
            className="prose prose-lg dark:prose-invert max-w-none
              prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto prose-img:block prose-img:max-w-full
              prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-pre:bg-muted prose-pre:text-muted-foreground prose-pre:border prose-pre:border-border
            "
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>
      </div>

      {/* 速記區 (Quick Note) */}
      <div
        className="p-4 border-t bg-muted/40 backdrop-blur"
        style={{ borderColor: tokens.colors.bgSubtle }}
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
            placeholder="紀錄您的靈感或重點摘要..."
            className="w-full h-24 bg-black/5 dark:bg-white/5 border border-border rounded-xl p-4 text-base focus:outline-none focus:border-primary/50 transition-colors resize-none no-scrollbar placeholder:text-muted-foreground/60 text-foreground"
          />
          <button
            disabled={!quickNote.trim()}
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
