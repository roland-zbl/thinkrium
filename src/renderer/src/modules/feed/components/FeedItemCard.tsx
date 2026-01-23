import React from 'react'
import { Bookmark, Clock } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { FeedItem } from '../store/feed.store'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/utils/date'

interface Props {
  item: FeedItem
  isActive: boolean
  onClick: () => void
}

export const FeedItemCard: React.FC<Props> = ({ item, isActive, onClick }) => {
  // Draggable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `feed-item-${item.id}`,
    data: { title: item.title }
  })

  const style = transform
    ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 100 : 'auto'
    }
    : undefined

  const handleCardClick = () => {
    if (isDragging) return // 防止拖曳結束時觸發點擊
    onClick() // selectItem 會自動呼叫 markAsRead
  }

  // 檢查是否為已讀狀態但在未讀列表中顯示 (recently read)
  const isRecentlyRead = item.status === 'read' && !isActive

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style
      }}
      {...listeners}
      {...attributes}
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      className={cn(
        'group flex gap-4 p-4 border-b cursor-pointer transition-colors duration-150 relative overflow-hidden border-border',
        isActive ? 'bg-primary/10' : 'hover:bg-muted/50',
        isRecentlyRead && 'opacity-60 bg-muted/20'
      )}
    >
      {/* 未讀指示器 (左側藍色條) */}
      {item.status === 'unread' && (
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
      )}

      {/* 主內容區 */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {/* 來源和時間 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cn(
            'font-semibold truncate',
            isActive ? 'text-primary' : 'text-muted-foreground'
          )}>
            {item.source}
          </span>
          <span className="text-muted-foreground/50">•</span>
          <div className="flex items-center gap-1 shrink-0">
            <Clock size={11} />
            <span>{formatRelativeTime(item.date)}</span>
          </div>
          {item.status === 'saved' && (
            <Bookmark size={12} className="text-primary fill-current shrink-0 ml-auto" />
          )}
        </div>

        {/* 標題 */}
        <h3
          className={cn(
            'text-[15px] leading-snug line-clamp-2 transition-colors',
            item.status === 'unread'
              ? 'font-bold text-foreground'
              : 'font-medium text-foreground/70',
            isActive && 'text-foreground'
          )}
        >
          {item.title}
        </h3>

        {/* 摘要 */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {item.summary}
        </p>
      </div>

      {/* 縮圖 */}
      {item.thumbnail && (
        <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted/50">
          <img
            src={item.thumbnail}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              // 圖片載入失敗時隱藏
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}
    </div>
  )
}

