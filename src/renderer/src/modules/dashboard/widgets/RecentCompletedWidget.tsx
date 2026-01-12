import React from 'react'
import { CheckCircle2, History } from 'lucide-react'
import { tokens } from '../../../styles/tokens'
import { mockProjects } from '../../../mocks'

export const RecentCompletedWidget: React.FC = () => {
  const completedProjects = mockProjects.filter((p) => p.status === 'completed')

  return (
    <div
      className="p-5 rounded-xl border flex flex-col h-[180px]"
      style={{ backgroundColor: tokens.colors.bgElevated, borderColor: tokens.colors.bgSubtle }}
    >
      <div className="flex items-center gap-2 text-muted-foreground font-bold mb-4">
        <CheckCircle2 size={18} className="text-success" />
        <span>近期已完成</span>
      </div>

      <div className="flex-1 space-y-2 overflow-auto no-scrollbar">
        {completedProjects.length > 0 ? (
          completedProjects.map((proj) => (
            <div
              key={proj.id}
              className="flex items-center justify-between p-2 rounded text-muted-foreground group hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <span className="text-sm truncate text-foreground">{proj.title}</span>
              <span className="text-xs whitespace-nowrap text-muted-foreground/80">
                {proj.targetDate}
              </span>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <History size={24} className="opacity-20" />
            <span className="text-xs">尚無已完成的專案</span>
          </div>
        )}
      </div>
    </div>
  )
}
