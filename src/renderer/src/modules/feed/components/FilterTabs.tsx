import React from 'react'
import { useFeedStore } from '../store/feed.store'
import { cn } from '../../../lib/utils'
import { tokens } from '../../../styles/tokens'

export const FilterTabs: React.FC = () => {
  const { filter, setFilter } = useFeedStore()

  const options = [
    { value: 'all', label: '全部' },
    { value: 'unread', label: '未讀' },
    { value: 'saved', label: '已保存' }
  ] as const

  return (
    <div
      className="flex px-4 border-b shrink-0 h-10 items-center gap-4"
      style={{ borderColor: tokens.colors.bgSubtle }}
    >
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
  )
}
