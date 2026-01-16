import React, { useState } from 'react'
import { Plus, FolderKanban } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { useProjectStore } from './store/project.store'
import { useAppStore } from '@/stores/app.store'
import { CreateProjectDialog } from './components/CreateProjectDialog'

export const ProjectListView: React.FC = () => {
  const { projects, createProject } = useProjectStore()
  const { addTab } = useAppStore()
  const [isCreateProjectDialogOpen, setCreateProjectDialogOpen] = useState(false)

  const handleCreateProject = async (title: string) => {
    await createProject({ title })
  }

  const statuses: { id: string; label: string; colorClass: string }[] = [
    { id: 'active', label: '進行中', colorClass: 'bg-primary' },
    { id: 'pending', label: '待啟動', colorClass: 'bg-warning' },
    { id: 'completed', label: '已完成', colorClass: 'bg-success' }
  ]

  return (
    <div className="h-full overflow-auto p-8 bg-background scrollbar-hide">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground">
              <FolderKanban className="text-primary" size={32} />
              專案管理
            </h1>
            <p className="text-muted-foreground text-base mt-2 ml-1">追蹤您的創作進度與素材整合</p>
          </div>
          <button
            onClick={() => setCreateProjectDialogOpen(true)}
            className="bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            新建專案
          </button>
        </header>

        <div className="space-y-12">
          {statuses.map((status) => {
            const statusProjects = projects.filter((p) => p.status === status.id)
            if (statusProjects.length === 0 && status.id !== 'active') return null

            return (
              <section key={status.id} className="space-y-4">
                <div
                  className="flex items-center gap-3 border-b pb-3 border-border"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${status.colorClass}`}
                  />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    {status.label}
                  </h2>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {statusProjects.length} 個專案
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {statusProjects.map((proj) => (
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
                      className="group bg-black/[0.02] dark:bg-white/[0.03] border border-border p-6 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {proj.title}
                        </h3>
                        {proj.targetDate && (
                          <div className="text-xs text-muted-foreground font-mono bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                            DUE: {proj.targetDate}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">
                            素材
                          </span>
                          <span className="text-xl font-light text-foreground">
                            {proj.materialCount}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">
                            產出
                          </span>
                          <span className="text-xl font-light text-foreground">
                            {proj.deliverableCount}
                          </span>
                        </div>
                      </div>

                      {/* 底部裝飾線 */}
                      <div
                        className={`absolute bottom-0 left-0 h-1 transition-all duration-300 group-hover:w-full ${status.colorClass}`}
                        style={{ width: '20%' }}
                      />
                    </div>
                  ))}

                  {statusProjects.length === 0 && status.id === 'active' && (
                    <div className="col-span-full py-8">
                      <EmptyState
                        icon={FolderKanban}
                        title="尚無進行中的專案"
                        description="目前沒有專案正在進行。您可以隨時建立新專案來開始您的創作旅程。"
                        action={{
                          label: '建立新專案',
                            onClick: () => setCreateProjectDialogOpen(true)
                        }}
                      />
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>
        <CreateProjectDialog
          isOpen={isCreateProjectDialogOpen}
          onClose={() => setCreateProjectDialogOpen(false)}
          onCreate={handleCreateProject}
        />
    </div>
  )
}
