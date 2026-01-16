import React from 'react'
import { FolderKanban, Plus, ExternalLink } from 'lucide-react'
import { useAppStore } from '@/stores/app.store'
import { useProjectStore } from '@/modules/project/store/project.store'

export const ActiveProjectsWidget: React.FC = () => {
  const { addTab } = useAppStore()
  const { projects } = useProjectStore()
  const activeProjects = projects.filter((p) => p.status === 'active')

  return (
    <div
      className="p-5 rounded-xl border flex flex-col h-[180px] bg-card border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <FolderKanban size={18} className="text-warning" />
          <span>進行中專案</span>
        </div>
        <button className="text-xs text-primary hover:underline flex items-center gap-1">
          <Plus size={12} /> 新增
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-auto no-scrollbar">
        {activeProjects.length > 0 ? (
          activeProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() =>
                addTab({
                  id: `project-${proj.id}`,
                  type: 'project-page',
                  title: proj.title,
                  data: { projectId: proj.id }
                })
              }
              className="group flex items-center justify-between p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate group-hover:text-primary text-foreground">
                  {proj.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {proj.materialCount} 素材 · {proj.deliverableCount} 產出
                </span>
              </div>
              <ExternalLink
                size={12}
                className="text-muted-foreground group-hover:text-primary transition-colors"
              />
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground/40">
            目前沒有進行中的專案
          </div>
        )}
      </div>
    </div>
  )
}
