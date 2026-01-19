import React, { useState } from 'react'
import { Plus, ListFilter, Hash, Trash2, MoreHorizontal, FileUp, FileDown } from 'lucide-react'
import { useFeedStore } from '../store/feed.store'
import { cn } from '@/lib/utils'
import { AddSubscriptionDialog } from './AddSubscriptionDialog'
import { ImportOpmlDialog } from './ImportOpmlDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@radix-ui/react-dropdown-menu'

export const SubscriptionSidebar: React.FC = () => {
  const {
    subscriptions,
    activeSubscriptionId,
    setActiveSubscription,
    removeFeed,
    exportOpml
  } = useFeedStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  // 按分類分組
  const categories = Array.from(new Set(subscriptions.map((s) => s.category)))

  const handleDelete = async (e: React.MouseEvent, id: string): Promise<void> => {
    e.stopPropagation()
    if (confirm('確定要刪除這個訂閱源嗎？')) {
      await removeFeed(id)
    }
  }

  return (
    <div className="h-full flex flex-col bg-card border-border">
      <div className="p-4 flex items-center justify-between border-b border-border">
        <span className="font-bold text-xs uppercase text-muted-foreground tracking-wider">
          訂閱源
        </span>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-muted-foreground transition-colors"
                title="更多選項"
                data-testid="more-options-button"
              >
                <MoreHorizontal size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
              align="end"
            >
              <DropdownMenuItem
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onClick={() => setIsImportDialogOpen(true)}
              >
                <FileUp className="mr-2 h-4 w-4" />
                <span>匯入 OPML</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onClick={() => exportOpml()}
              >
                <FileDown className="mr-2 h-4 w-4" />
                <span>匯出 OPML</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-primary transition-colors"
            title="新增訂閱"
          >
            <Plus size={18} />
          </button>
        </div>
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
                <div
                  key={sub.id}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2 text-sm transition-colors group cursor-pointer relative',
                    activeSubscriptionId === sub.id
                      ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary'
                      : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
                  )}
                  onClick={() => setActiveSubscription(sub.id)}
                >
                  <div className="flex items-center gap-3 truncate flex-1 min-w-0">
                    <Hash
                      size={16}
                      className="text-muted-foreground group-hover:text-primary/40 shrink-0"
                    />
                    <span className="truncate">{sub.name}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {sub.unreadCount > 0 && (
                      <span className="text-xs bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary min-w-[20px] text-center">
                        {sub.unreadCount}
                      </span>
                    )}

                    {/* 刪除按鈕：僅在 hover 時顯示，或選中時顯示 */}
                    <button
                      onClick={(e) => handleDelete(e, sub.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-500 rounded transition-all"
                      title="刪除訂閱"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      <AddSubscriptionDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} />
      <ImportOpmlDialog isOpen={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} />
    </div>
  )
}
