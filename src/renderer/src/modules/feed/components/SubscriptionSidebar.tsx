import React from 'react'
import { Plus, ListFilter, Hash } from 'lucide-react'
import { useFeedStore } from '../store/feed.store'
import { tokens } from '../../../styles/tokens'
import { cn } from '../../../lib/utils'

export const SubscriptionSidebar: React.FC = () => {
  const { subscriptions, activeSubscriptionId, setActiveSubscription } = useFeedStore()

  // 按分類分組
  const categories = Array.from(new Set(subscriptions.map((s) => s.category)))

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: tokens.colors.bgElevated, borderColor: tokens.colors.bgSubtle }}
    >
      <div className="p-4 flex items-center justify-between border-b border-border">
        <span className="font-bold text-xs uppercase text-muted-foreground tracking-wider">
          訂閱源
        </span>
        <button className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-primary transition-colors">
          <Plus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <button
          onClick={() => setActiveSubscription(null)}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors',
            activeSubscriptionId === null
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
          )}
        >
          <ListFilter size={18} />
          <span>全部項目</span>
        </button>

        {categories.map((cat) => (
          <div key={cat} className="mt-6">
            <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {cat}
            </div>
            {subscriptions
              .filter((s) => s.category === cat)
              .map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubscription(sub.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2 text-sm transition-colors group',
                    activeSubscriptionId === sub.id
                      ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary'
                      : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Hash size={16} className="text-muted-foreground group-hover:text-primary/40" />
                    <span className="truncate">{sub.name}</span>
                  </div>
                  {sub.unreadCount > 0 && (
                    <span className="text-xs bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary min-w-[20px] text-center">
                      {sub.unreadCount}
                    </span>
                  )}
                </button>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}
