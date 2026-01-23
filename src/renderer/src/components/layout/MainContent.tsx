import React from 'react'
import { useAppStore } from '@/stores/app.store'
import { cn } from '@/lib/utils'
import { DashboardView } from '@/modules/dashboard/DashboardView'
import { FeedView } from '@/modules/feed/FeedView'
import { LibraryView } from '@/modules/library/LibraryView'
import { ProjectListView } from '@/modules/project/ProjectListView'
import { ProjectPageView } from '@/modules/project/ProjectPageView'
import { NoteEditor } from '@/modules/note/components/NoteEditor'

export const MainContent: React.FC = () => {
  const { currentView, activeTabId, tabs } = useAppStore()

  const isTabView = activeTabId !== null

  return (
    <main className="flex-1 relative overflow-hidden bg-background">
      {/* 導航視圖：使用 display: none 保持狀態 */}
      <div
        className={cn(
          'absolute inset-0 bg-background',
          isTabView || currentView !== 'dashboard'
            ? 'hidden'
            : 'animate-in fade-in duration-200 ease-micro'
        )}
      >
        <DashboardView />
      </div>
      <div
        className={cn(
          'absolute inset-0 bg-background',
          isTabView || currentView !== 'feed'
            ? 'hidden'
            : 'animate-in fade-in duration-200 ease-micro'
        )}
      >
        <FeedView />
      </div>
      <div
        className={cn(
          'absolute inset-0 bg-background',
          isTabView || currentView !== 'library'
            ? 'hidden'
            : 'animate-in fade-in duration-200 ease-micro'
        )}
      >
        <LibraryView />
      </div>
      <div
        className={cn(
          'absolute inset-0 bg-background',
          isTabView || currentView !== 'project'
            ? 'hidden'
            : 'animate-in fade-in duration-200 ease-micro'
        )}
      >
        <ProjectListView />
      </div>

      {/* Tab 視圖 */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            'absolute inset-0 bg-background',
            activeTabId !== tab.id ? 'hidden' : 'animate-in fade-in duration-200 ease-micro'
          )}
        >
          {tab.type === 'editor' ? (
            <NoteEditor noteId={tab.data.noteId || tab.id} />
          ) : (
            <ProjectPageView id={tab.data.projectId || tab.id} />
          )}
        </div>
      ))}
    </main>
  )
}
