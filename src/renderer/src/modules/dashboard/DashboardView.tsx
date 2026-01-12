import React from 'react'
import { TodayFocusWidget } from '@renderer/modules/dashboard/widgets/TodayFocusWidget'
import { ActiveProjectsWidget } from '@renderer/modules/dashboard/widgets/ActiveProjectsWidget'
import { NewItemsWidget } from '@renderer/modules/dashboard/widgets/NewItemsWidget'
import { RecentCompletedWidget } from '@renderer/modules/dashboard/widgets/RecentCompletedWidget'

export const DashboardView: React.FC = () => {
  return (
    <div className="h-full overflow-auto p-6 scrollbar-hide">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">歡迎回來，Roland</h1>
          <p className="text-muted-foreground text-sm">這是您今日的概覽</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TodayFocusWidget />
          <ActiveProjectsWidget />
          <NewItemsWidget />
          <RecentCompletedWidget />
        </div>
      </div>
    </div>
  )
}
