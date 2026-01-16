import { useDroppable } from '@dnd-kit/core'
import {
  Home,
  Newspaper,
  Library,
  FolderKanban,
  Bot,
  Settings,
  Monitor,
  Moon,
  Sun
} from 'lucide-react'
import { useAppStore, ViewType } from '../../stores/app.store'
import { tokens } from '../../styles/tokens'
import { cn } from '../../lib/utils'
import { mockProjects } from '../../mocks'

// Droppable Nav Item Component
const DroppableNavItem = ({ item, isActive, onClick, expanded }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: item.id === 'project' ? 'nav-project' : `nav-${item.id}`,
    disabled: item.id !== 'project' // 只允許放置到 Project
  })

  const style = {
    color: isActive ? tokens.colors.primary : 'inherit',
    backgroundColor: isOver
      ? document.documentElement.classList.contains('dark')
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.05)'
      : undefined
  }

  const Icon = item.icon

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group relative',
        isActive && 'text-primary'
      )}
      style={style}
      title={item.label}
    >
      {isOver && item.id === 'project' && (
        <div className="absolute inset-0 border-2 border-primary rounded opacity-50 pointer-events-none" />
      )}
      <Icon size={22} className="shrink-0" aria-hidden="true" />
      <span
        className={cn(
          'whitespace-nowrap transition-opacity text-sm font-medium tracking-wide',
          expanded ? 'opacity-100' : 'opacity-0 hidden'
        )}
      >
        {item.label}
      </span>
    </button>
  )
}

// Droppable Project Item Component
const DroppableProjectItem = ({ project }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `project-${project.id}`
  })

  return (
    <button
      ref={setNodeRef}
      className={cn(
        'text-sm text-left truncate py-1.5 transition-colors relative',
        isOver
          ? 'text-primary bg-primary/10 pl-2 rounded'
          : 'text-muted-foreground hover:text-primary'
      )}
      onClick={() => {
        useAppStore.getState().addTab({
          id: `project-${project.id}`,
          type: 'project-page',
          title: project.title,
          data: { projectId: project.id }
        })
      }}
    >
      {project.title}
    </button>
  )
}

const NAV_ITEMS = [
  { id: 'dashboard', icon: Home, label: '首頁' },
  { id: 'feed', icon: Newspaper, label: 'Feed' },
  { id: 'library', icon: Library, label: 'Library' },
  { id: 'project', icon: FolderKanban, label: 'Project' }
]

export const Sidebar: React.FC = () => {
  const { currentView, setView, sidebarExpanded, activeTabId, setActiveTab } = useAppStore()

  const handleNavClick = (viewId: string) => {
    if (activeTabId) setActiveTab(null)
    setView(viewId as ViewType)
  }

  return (
    <div
      className={cn(
        'flex flex-col border-r h-full transition-all duration-200 z-30',
        sidebarExpanded ? 'w-[200px]' : 'w-[56px]'
      )}
      style={{
        backgroundColor: tokens.colors.bgElevated,
        borderColor: tokens.colors.bgSubtle
      }}
      onMouseEnter={() => !sidebarExpanded && useAppStore.getState().setSidebarExpanded(true)}
      onMouseLeave={() => sidebarExpanded && useAppStore.getState().setSidebarExpanded(false)}
    >
      {/* 導航項 */}
      <div className="flex-1 py-4 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id && !activeTabId
          return (
            <DroppableNavItem
              key={item.id}
              item={item}
              isActive={isActive}
              onClick={() => handleNavClick(item.id)}
              expanded={sidebarExpanded}
            />
          )
        })}

        <div className="h-px bg-black/5 dark:bg-white/5 my-2" />

        {/* 展開後的專案快速列表 */}
        {sidebarExpanded && (
          <div className="px-4 py-2 flex flex-col gap-1 overflow-auto">
            <span className="text-xs uppercase text-muted-foreground font-bold mb-2 tracking-wider">
              近期專案
            </span>
            {mockProjects
              .filter((p) => p.status === 'active')
              .slice(0, 5)
              .map((proj) => (
                <DroppableProjectItem key={proj.id} project={proj} />
              ))}
          </div>
        )}
      </div>

      {/* 底部工具 */}
      <div
        className="py-4 border-t flex flex-col gap-2"
        style={{ borderColor: tokens.colors.bgSubtle }}
      >
        <button
          className="flex items-center gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
          onClick={() => useAppStore.getState().toggleAuxPanel()}
        >
          <Bot size={22} aria-hidden="true" />
          {sidebarExpanded && <span className="text-sm font-medium">AI 助手</span>}
        </button>
        <button className="flex items-center gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
          <Settings size={22} aria-hidden="true" />
          {sidebarExpanded && <span className="text-sm font-medium">設定</span>}
        </button>

        <div className="mx-2 my-2 border-t border-black/5 dark:border-white/5" />
        <ThemeToggle />
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useAppStore()

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light')
    else if (theme === 'light') setTheme('dark')
    else setTheme('system')
  }

  const Icon = theme === 'system' ? Monitor : theme === 'dark' ? Moon : Sun
  const label = theme === 'system' ? '跟隨系統' : theme === 'dark' ? '深色模式' : '淺色模式'

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        'w-[calc(100%-16px)] mx-2 p-2 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-all',
        'group relative'
      )}
      title={`目前模式：${label}`}
    >
      <Icon size={20} aria-label={label} />
    </button>
  )
}
