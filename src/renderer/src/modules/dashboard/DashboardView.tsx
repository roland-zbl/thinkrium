import React, { useState, useEffect } from 'react'
import { TodayFocusWidget } from '@/modules/dashboard/widgets/TodayFocusWidget'
import { ActiveProjectsWidget } from '@/modules/dashboard/widgets/ActiveProjectsWidget'
import { NewItemsWidget } from '@/modules/dashboard/widgets/NewItemsWidget'
import { RecentCompletedWidget } from '@/modules/dashboard/widgets/RecentCompletedWidget'
import { useProjectStore } from '../project/store/project.store'
import { useFeedStore } from '../feed/store/feed.store'
import { invokeIPC } from '@/utils/ipc'

export const DashboardView: React.FC = () => {
  const { fetchProjects } = useProjectStore()
  const { fetchItems, fetchSubscriptions } = useFeedStore()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const name = await invokeIPC(window.api.settings.get('user.name'))
        setUserName(name)
      } catch (error) {
        console.error('Failed to fetch user name', error)
      }
      fetchProjects()
      // 確保先載入訂閱源，再載入文章（避免 source 顯示為 Unknown）
      await fetchSubscriptions()
      await fetchItems()
    }
    init()
  }, [])

  return (
    <div className="h-full overflow-auto p-6 scrollbar-hide">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            歡迎回來{userName ? `，${userName}` : ''}
          </h1>
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
