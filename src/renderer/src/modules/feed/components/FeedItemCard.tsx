import React from 'react'
import { Bookmark, Clock } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { FeedItem, useFeedStore } from '../store/feed.store'
import { tokens } from '../../../styles/tokens'
import { cn } from '../../../lib/utils'

interface Props {
  item: FeedItem
  isActive: boolean
  onClick: () => void
}

export const FeedItemCard: React.FC<Props> = ({ item, isActive, onClick }) => {
  const { markAsRead } = useFeedStore()

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
    onClick()
    if (item.status === 'unread') {
      markAsRead(item.id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderColor: tokens.colors.bgSubtle
      }}
      {...listeners}
      {...attributes}
      onClick={handleCardClick}
      className={cn(
        'group flex flex-col gap-2 p-5 border-b cursor-pointer transition-all relative overflow-hidden',
        isActive ? 'bg-primary/10' : 'hover:bg-accent/20 dark:hover:bg-white/[0.02]'
      )}
    >
      {/* 未讀指示器 (左側藍色條) */}
      {item.status === 'unread' && (
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-bold tracking-tight mb-1">
        <span className={cn(isActive ? 'text-primary' : 'text-muted-foreground')}>
          {item.source}
        </span>
        <div className="flex items-center gap-2">
          {item.status === 'saved' && <Bookmark size={14} className="text-primary fill-current" />}
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{item.date}</span>
          </div>
        </div>
      </div>

      <h3
        className={cn(
          'text-base leading-relaxed line-clamp-2 transition-colors',
          item.status === 'unread'
            ? 'font-bold text-foreground'
            : 'font-medium text-muted-foreground',
          isActive && 'text-foreground'
        )}
      >
        {item.title}
      </h3>

      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed group-hover:text-foreground transition-colors">
        {item.summary}
      </p>
    </div>
  )
}
