import React, { useState, useEffect, useRef } from 'react'
import { Search, Folder, Plus } from 'lucide-react'
import { mockProjects } from '../../../mocks'
import { tokens } from '../../../styles/tokens'
import { cn } from '../../../lib/utils'
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/dialog'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (projectId: string) => void
  title?: string
}

export const ProjectSelectorDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelect,
  title = '加入專案'
}) => {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // 過濾專案
  const filteredProjects = mockProjects.filter(
    (p) => p.title.toLowerCase().includes(search.toLowerCase()) && p.status === 'active'
  )

  // 重置選中索引
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // 自動聚焦
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setSearch('')
    }
  }, [isOpen])

  // 鍵盤導航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filteredProjects.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredProjects[selectedIndex]) {
        onSelect(filteredProjects[selectedIndex].id)
        onClose()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 gap-0 overflow-hidden max-w-md border-none shadow-2xl">
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div
          className="w-full flex flex-col"
          style={{ backgroundColor: tokens.colors.bgElevated }}
        >
          <div
            className="p-3 border-b flex items-center gap-2"
            style={{ borderColor: tokens.colors.bgSubtle }}
          >
            <Search className="text-muted-foreground shrink-0" size={18} aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              placeholder={title}
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder-muted-foreground h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="flex gap-1 shrink-0">
              <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] text-muted-foreground font-mono">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] text-muted-foreground font-mono">
                ↓
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] text-muted-foreground font-mono">
                ↵
              </kbd>
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredProjects.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">無符合專案</div>
            ) : (
              filteredProjects.map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => {
                    onSelect(project.id)
                    onClose()
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                    index === selectedIndex
                      ? 'bg-primary text-white'
                      : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                >
                  <Folder
                    size={16}
                    className={cn(index === selectedIndex ? 'text-white' : 'text-primary')}
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate">{project.title}</span>
                  {index === selectedIndex && (
                    <span className="text-xs opacity-70 shrink-0">Enter 選擇</span>
                  )}
                </button>
              ))
            )}
          </div>

          <div
            className="p-2 border-t bg-black/5 dark:bg-black/20"
            style={{ borderColor: tokens.colors.bgSubtle }}
          >
            <button className="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Plus size={14} aria-hidden="true" />
              建立新專案 "{search || '未命名'}"
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
