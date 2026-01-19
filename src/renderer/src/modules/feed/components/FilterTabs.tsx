import React from 'react'
import { useFeedStore } from '../store/feed.store'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip'

export const FilterTabs: React.FC = () => {
  const { filter, setFilter, autoHideRead, toggleAutoHideRead } = useFeedStore()

  const options = [
    { value: 'all', label: '全部' },
    { value: 'unread', label: '未讀' },
    { value: 'saved', label: '已保存' }
  ] as const

  return (
    <div className="flex px-4 border-b shrink-0 h-10 items-center justify-between border-border">
      <div className="flex items-center gap-4 h-full">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
              'text-xs font-bold transition-all h-full relative px-1',
              filter === opt.value ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.label}
            {filter === opt.value && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleAutoHideRead}
              className={cn(
                'p-1.5 rounded transition-colors',
                autoHideRead
                  ? 'text-primary bg-primary/10 hover:bg-primary/20'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {autoHideRead ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {autoHideRead ? '已啟用：自動隱藏已讀文章' : '已停用：保留已讀文章'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
