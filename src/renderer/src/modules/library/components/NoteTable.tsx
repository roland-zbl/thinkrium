import React, { useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useLibraryStore } from '../store/library.store'
import { useAppStore } from '@/stores/app.store'
import { cn } from '@/lib/utils'
import { Calendar, FileText, Tag } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Note } from '@/types'

export const NoteTable: React.FC = () => {
  const { notes, filters, selectedNoteId, selectNote } = useLibraryStore()
  const { addTab } = useAppStore()
  const parentRef = useRef<HTMLDivElement>(null)

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Type 過濾
      const matchType = filters.type === '全部' ? true : n.type === filters.type

      // Project 過濾
      const matchProject = filters.project === '全部' ? true : (n.projects || []).includes(filters.project)

      // Tag 過濾
      const matchTag = filters.tag === '全部' ? true : (n.tags || []).includes(filters.tag)

      // Date 過濾
      const matchDate = (() => {
        if (filters.date === '全部') return true

        const noteDate = new Date(n.date || '')
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        switch (filters.date) {
          case '今日':
            const todayStr = today.toISOString().split('T')[0]
            return n.date === todayStr
          case '本週':
            const weekAgo = new Date(today)
            weekAgo.setDate(today.getDate() - 7)
            return noteDate >= weekAgo && noteDate <= today
          case '本月':
            return (
              noteDate.getMonth() === today.getMonth() &&
              noteDate.getFullYear() === today.getFullYear()
            )
          default:
            return true
        }
      })()

      return matchType && matchProject && matchTag && matchDate
    })
  }, [notes, filters])

  const virtualizer = useVirtualizer({
    count: filteredNotes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44, // Increased row height slightly for comfort
    overscan: 10
  })

  const handleDoubleClick = (note: Note) => {
    addTab({
      id: note.id,
      type: 'editor',
      title: note.title,
      data: { noteId: note.id }
    })
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 表頭 */}
      <div
        className="flex items-center px-6 py-3 border-b text-xs font-bold text-muted-foreground uppercase tracking-widest bg-white/40 dark:bg-black/20 backdrop-blur border-border"
      >
        <div className="w-24 px-2">日期</div>
        <div className="flex-1 px-2 text-muted-foreground">標題</div>
        <div className="w-24 px-2 text-center">類型</div>
        <div className="w-32 px-2">關聯專案</div>
      </div>

      <div ref={parentRef} className="flex-1 overflow-auto no-scrollbar relative">
        {filteredNotes.length > 0 ? (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative'
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const note = filteredNotes[virtualItem.index]
              const isActive = selectedNoteId === note.id

              return (
                <div
                  key={note.id}
                  onClick={() => selectNote(note.id)}
                  onDoubleClick={() => handleDoubleClick(note)}
                  className={cn(
                    'absolute top-0 left-0 w-full flex items-center px-6 h-[44px] border-b cursor-pointer transition-colors group text-sm border-border',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-black/5 dark:hover:bg-white/[0.04] hover:text-foreground'
                  )}
                  style={{
                    transform: `translateY(${virtualItem.start}px)`
                  }}
                >
                  <div className="w-24 px-2 flex items-center gap-2 text-muted-foreground text-xs">
                    <Calendar size={14} />
                    {note.date}
                  </div>
                  <div className="flex-1 px-2 font-medium truncate flex items-center gap-2 text-base">
                    <FileText
                      size={18}
                      className={
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-primary/60'
                      }
                    />
                    {note.title}
                  </div>
                  <div className="w-24 px-2 text-center capitalize">
                    <span className="bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded text-xs text-muted-foreground">
                      {note.type}
                    </span>
                  </div>
                  <div className="w-32 px-2 truncate flex gap-2 items-center text-muted-foreground">
                    {(note.projects || []).length > 0 ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Tag size={12} />
                        {note.projects![0]}
                      </div>
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              icon={FileText}
              title="沒有符合的筆記"
              description="目前的篩選條件下找不到任何筆記，或是您的資料庫目前是空的。"
              action={{
                label: '建立新筆記',
                onClick: () =>
                  addTab({ id: 'new-note', type: 'editor', title: '未命名筆記', data: {} })
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
