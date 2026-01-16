import React from 'react'
import {
  ArrowLeft,
  Settings2,
  FileText,
  LayoutList,
  History,
  CheckCircle2,
  Clock,
  MoreVertical
} from 'lucide-react'
import { useProjectStore } from './store/project.store'
import { useAppStore } from '../../stores/app.store'
import { tokens } from '../../styles/tokens'
import { cn } from '../../lib/utils'
import { mockNotes } from '../../mocks'

export const ProjectPageView: React.FC<{ id: string }> = ({ id }) => {
  const { projects, updateProjectStatus } = useProjectStore()
  const { setActiveTab } = useAppStore()

  const project = projects.find((p) => p.id === id)

  if (!project) return <div className="p-8">專案不存在</div>

  const relatedNotes = mockNotes.filter((n) => n.projects.includes(project.title))

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* 專案標頭 */}
      <header className="p-8 border-b shrink-0" style={{ borderColor: tokens.colors.bgSubtle }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setActiveTab(null as any)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs font-bold transition-colors"
            >
              <ArrowLeft size={16} aria-hidden="true" /> 返回列表
            </button>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                <Settings2 size={18} aria-hidden="true" />
              </button>
              <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                <MoreVertical size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{project.title}</h1>
                <div
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border',
                    project.status === 'active'
                      ? 'text-primary border-primary/20 bg-primary/5'
                      : 'text-muted-foreground border-border'
                  )}
                >
                  {project.status}
                </div>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground text-xs">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} aria-hidden="true" /> 建立於 2026-01-01
                </span>
                {project.targetDate && (
                  <span className="flex items-center gap-1.5 text-warning/60">
                    <History size={14} aria-hidden="true" /> 目標日期: {project.targetDate}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 專案內容網格 */}
      <div className="flex-1 overflow-auto p-8 scrollbar-hide">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：大綱與筆記列表 */}
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <LayoutList size={16} aria-hidden="true" /> 專案素材 ({relatedNotes.length})
              </h2>
              <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-border rounded-xl overflow-hidden">
                {relatedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-4 border-b border-border hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText
                        size={16}
                        className="text-muted-foreground group-hover:text-primary transition-colors"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                        {note.title}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{note.date}</span>
                  </div>
                ))}
                <button className="w-full p-4 text-xs text-primary/60 hover:text-primary hover:bg-primary/5 transition-all text-center font-medium">
                  + 關聯現有素材
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <CheckCircle2 size={16} aria-hidden="true" /> 最終產出
              </h2>
              <div className="h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground italic text-sm">
                目前尚無產出檔案
              </div>
            </section>
          </div>

          {/* 右側：專案資訊與筆記 */}
          <div className="space-y-8">
            <section className="bg-black/[0.03] dark:bg-white/[0.03] border border-border p-6 rounded-xl space-y-4">
              <h2 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                策劃筆記
              </h2>
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                {project.notes || '尚未填寫筆記...'}
              </p>
              <button className="text-xs text-primary hover:underline">編輯筆記</button>
            </section>

            <section className="bg-black/[0.03] dark:bg-white/[0.03] border border-border p-6 rounded-xl space-y-4">
              <h2 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                專案狀態
              </h2>
              <div className="space-y-2">
                {(['active', 'pending', 'completed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateProjectStatus(project.id, s)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded text-xs transition-colors',
                      project.status === s
                        ? 'bg-primary text-white font-bold'
                        : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
                    )}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
