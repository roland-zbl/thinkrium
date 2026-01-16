import React from 'react'
import { Filter, RotateCcw, ChevronDown } from 'lucide-react'
import { useLibraryStore } from '../store/library.store'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export const FilterBar: React.FC = () => {
  const { filters, setFilter, resetFilters } = useLibraryStore()

  const filterConfigs = [
    { key: 'type', label: '類型', options: ['全部', 'daily', 'note'] },
    { key: 'tag', label: '標籤', options: ['全部', '遊戲', 'AI', '工作'] },
    { key: 'date', label: '日期', options: ['全部', '今日', '本週', '本月'] },
    { key: 'project', label: '關聯專案', options: ['全部', 'vol.40', '星鐵分析', '追蹤Larian'] }
  ] as const

  return (
    <div
      className="h-12 border-b flex items-center px-6 gap-6 shrink-0 bg-white/60 dark:bg-black/20 backdrop-blur border-border"
    >
      <div className="flex items-center gap-2 text-muted-foreground mr-2">
        <Filter size={16} />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          過濾
        </span>
      </div>

      <div className="flex gap-6 flex-1">
        {filterConfigs.map((cfg) => (
          <DropdownMenu key={cfg.key}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors focus:outline-none font-medium group">
                <span className="opacity-60 group-hover:opacity-80 transition-opacity">
                  {cfg.label}:
                </span>
                <span className={cn(filters[cfg.key] !== '全部' && 'text-primary')}>
                  {filters[cfg.key]}
                </span>
                <ChevronDown
                  size={14}
                  className="opacity-50 text-muted-foreground group-hover:text-foreground"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover backdrop-blur border border-border text-popover-foreground min-w-[140px]">
              {cfg.options.map((opt) => (
                <DropdownMenuItem
                  key={opt}
                  onClick={() => setFilter(cfg.key, opt)}
                  className={cn(
                    'cursor-pointer focus:bg-accent focus:text-accent-foreground',
                    filters[cfg.key] === opt &&
                      'text-primary font-medium bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 focus:text-primary'
                  )}
                >
                  {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>

      <button
        onClick={resetFilters}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
      >
        <RotateCcw size={14} />
        <span className="text-xs font-medium">重置</span>
      </button>
    </div>
  )
}
