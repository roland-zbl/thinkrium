import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useFeedStore } from '../store/feed.store'
import { cn } from '@/lib/utils'
import { FeedItemCard } from './FeedItemCard'
import { FeedItemSkeleton } from './FeedItemSkeleton'
import { FilterTabs } from './FilterTabs'
import { EmptyState } from '@/components/ui/EmptyState'
import { Rss, Search, Inbox, CheckCircle, Bookmark } from 'lucide-react'

export const FeedItemList: React.FC = () => {
  const {
    items,
    loading,
    activeSubscriptionId,
    filter,
    selectedItemId,
    selectItem,
    recentlyReadIds,
    autoHideRead,
    subscriptions,
    searchQuery,
    clearSearch
  } = useFeedStore()
  const parentRef = useRef<HTMLDivElement>(null)

  // 動畫控制：僅在初始加載或過濾器變更時觸發
  const [isInitial, setIsInitial] = useState(true)

  useEffect(() => {
    setIsInitial(true)
    const timer = setTimeout(() => setIsInitial(false), 1000)
    return () => clearTimeout(timer)
  }, [activeSubscriptionId, filter, searchQuery, items.length])

  // 根據訂閱源和狀態過濾列表
  // 使用 feed_id 直接比對，避免名稱比對的不穩定性
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 使用 feed_id 直接比對，而非透過 source 名稱
      const matchSub = activeSubscriptionId ? item.feed_id === activeSubscriptionId : true

      let matchStatus = true
      if (filter === 'unread') {
        matchStatus = item.status === 'unread' || recentlyReadIds.has(item.id)
      } else if (filter === 'saved') {
        matchStatus = item.status === 'saved'
      } else {
        // filter === 'all'
        // If autoHideRead is strictly for 'unread' filter, then this block is mostly pass-through.
        // BUT if user expects 'Checkmark' button (autoHideRead) to work in 'All' view too?
        // Usually 'All' means All history.
        // However, if the button is a toggle "Hide Read", it should probably apply.
        // Let's assume user wants 'Hide Read' behavior globally if enabled?
        // The Store says `toggleAutoHideRead`.
        // Let's check `autoHideRead` logic in store... it only affects `recentlyReadIds`.
        // If I change it here to filter read items, it matches user expectation.
        if (autoHideRead) {
          matchStatus = item.status === 'unread' || recentlyReadIds.has(item.id)
        }
      }

      return matchSub && matchStatus
    })
  }, [items, activeSubscriptionId, filter, recentlyReadIds, autoHideRead])

  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140, // 卡片大約高度 (含 Padding)
    overscan: 5
  })

  return (
    <div className="h-full flex flex-col bg-background">
      <FilterTabs />

      <div ref={parentRef} className="flex-1 overflow-auto scrollbar-hide relative">
        {loading && items.length === 0 ? (
          // Loading State - Show 5 skeletons
          <div className="flex flex-col">
            {Array.from({ length: 5 }).map((_, i) => (
              <FeedItemSkeleton key={i} />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative'
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = filteredItems[virtualItem.index]
              const shouldAnimate = isInitial && virtualItem.index < 15

              return (
                <div
                  key={item.id}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  className={cn(
                    shouldAnimate &&
                      'animate-in fade-in slide-in-from-bottom-2 duration-300 ease-micro'
                  )}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                    animationDelay: shouldAnimate ? `${virtualItem.index * 30}ms` : undefined,
                    animationFillMode: shouldAnimate ? 'backwards' : undefined
                  }}
                >
                  <FeedItemCard
                    item={item}
                    isActive={selectedItemId === item.id}
                    onClick={() => selectItem(item.id)}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            {(() => {
              if (subscriptions.length === 0) {
                return (
                  <EmptyState
                    icon={Rss}
                    title="尚無訂閱源"
                    description="新增您的第一個訂閱源以開始閱讀來自世界各地的精彩內容。"
                    action={{
                      label: '新增訂閱',
                      onClick: () => window.dispatchEvent(new Event('open-add-subscription-dialog'))
                    }}
                  />
                )
              }

              if (searchQuery) {
                return (
                  <EmptyState
                    icon={Search}
                    title="無搜尋結果"
                    description={`找不到與 "${searchQuery}" 相符的文章。請嘗試調整關鍵字。`}
                    action={{
                      label: '清除搜尋',
                      onClick: () => clearSearch()
                    }}
                  />
                )
              }

              if (filter === 'saved') {
                return (
                  <EmptyState
                    icon={Bookmark}
                    title="尚無保存的文章"
                    description="您可以在閱讀文章時點擊書籤圖示將其保存至此。"
                  />
                )
              }

              if (filter === 'unread') {
                return (
                  <EmptyState
                    icon={CheckCircle}
                    title="太棒了！"
                    description="您已讀完所有未讀文章。"
                  />
                )
              }

              return (
                <EmptyState
                  icon={Inbox}
                  title="目前沒有文章"
                  description="該分類下暫無文章。"
                />
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
