import React from 'react'
import { Mail, ArrowRight } from 'lucide-react'
import { useFeedStore } from '@/modules/feed/store/feed.store'
import { useAppStore } from '@/stores/app.store'
import { tokens } from '@/styles/tokens'

export const NewItemsWidget: React.FC = () => {
  const { items } = useFeedStore()
  const { setView } = useAppStore()

  const unreadItems = items.filter((i) => i.status === 'unread')
  const unreadCount = unreadItems.length
  const latestItems = unreadItems.slice(0, 3)

  return (
    <div
      className="group flex flex-col justify-between p-5 rounded-xl border flex flex-col h-full hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden"
      style={{ backgroundColor: tokens.colors.bgElevated, borderColor: tokens.colors.bgSubtle }}
      onClick={() => setView('feed')}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
            <Mail size={20} />
          </div>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
            最新資訊
          </h3>
        </div>
        {unreadCount > 0 && (
          <span className="px-2 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount} NEW
          </span>
        )}
      </div>

      <div className="space-y-4">
        {latestItems.length > 0 ? (
          latestItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 text-sm text-foreground/70 group-hover:text-foreground transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
              <span className="truncate font-medium">{item.title}</span>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-3 text-muted-foreground">
            <div className="p-3 bg-primary/5 rounded-full text-primary/40">
              <Mail size={24} />
            </div>
            <span className="text-sm font-medium italic text-muted-foreground/80">
              目前環境一片和諧
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-primary font-bold group-hover:translate-x-1 transition-transform">
        前往閱讀列表 <ArrowRight size={14} />
      </div>
    </div>
  )
}
