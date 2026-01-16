import React from 'react'
import { Calendar, AlertCircle, Plus } from 'lucide-react'
import { useAppStore } from '@/stores/app.store'
import { useLibraryStore } from '@/modules/library/store/library.store'
import { useProjectStore } from '@/modules/project/store/project.store'

export const TodayFocusWidget: React.FC = () => {
  const { addTab } = useAppStore()
  const { notes } = useLibraryStore()
  const { projects } = useProjectStore()

  // 模擬邏輯
  const today = new Date().toISOString().split('T')[0]
  const todayDiary = notes.find((n) => n.type === 'daily' && n.date === today)

  const mostUrgentProject = [...projects]
    .filter((p) => p.status === 'active' && p.targetDate)
    .sort((a, b) => (a.targetDate || '').localeCompare(b.targetDate || ''))[0]

  return (
    <div
      className="p-5 rounded-xl flex flex-col gap-4 border h-[180px] bg-card border-border"
    >
      <div className="flex items-center gap-2 text-primary font-bold">
        <Calendar size={18} />
        <span>今日重點</span>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* 日記入口 */}
        <button
          onClick={() =>
            addTab({
              id: todayDiary ? todayDiary.id : 'new-diary',
              type: 'editor',
              title: todayDiary ? todayDiary.title : '今日日記',
              data: { noteId: todayDiary?.id }
            })
          }
          className="flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-background to-muted/30 hover:to-muted/50 transition-all border border-black/5 dark:border-white/5 hover:border-primary/20 group shadow-sm hover:shadow-md"
        >
          {todayDiary ? (
            <>
              <div className="p-2 bg-primary/10 rounded-full text-primary mb-1 group-hover:scale-110 transition-transform">
                <Calendar size={18} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">繼續寫日記</span>
              <span className="text-sm font-bold text-foreground">{todayDiary.title}</span>
            </>
          ) : (
            <>
              <div className="p-3 bg-primary/10 rounded-full text-primary mb-1 group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <span className="text-sm font-bold text-primary">開始寫日記</span>
            </>
          )}
        </button>

        {/* 緊急專案 */}
        <div className="flex flex-col justify-center gap-1 rounded-xl bg-gradient-to-br from-background to-warning/5 p-4 border border-black/5 dark:border-white/5 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <AlertCircle size={48} />
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle size={14} className="text-warning" />
            <span className="text-[10px] uppercase text-warning font-bold tracking-wider">
              最緊急專案
            </span>
          </div>
          {mostUrgentProject ? (
            <>
              <span className="text-sm font-bold text-foreground truncate">
                {mostUrgentProject.title}
              </span>
              <span className="text-xs text-warning/90 font-medium">
                {mostUrgentProject.targetDate} (需衝刺)
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">目前無緊急專案</span>
          )}
        </div>
      </div>
    </div>
  )
}
