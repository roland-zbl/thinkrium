import React, { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  DragStartEvent
} from '@dnd-kit/core'
import { useAppStore } from '@/stores/app.store'
import { useFeedStore } from '@/modules/feed/store/feed.store'
import { useProjectStore } from '@/modules/project/store/project.store'
import { Sidebar } from './Sidebar'
import { MainContent } from './MainContent'
import { AuxPanel } from './AuxPanel'
import { TabBar } from './TabBar'
import { ProjectSelectorDialog } from '@/modules/project/components/ProjectSelectorDialog'
import { Toaster } from '@/components/ui/Toast'
import { useToastStore } from '@/stores/toast.store'

export const AppShell: React.FC = () => {
  const { tabs, auxPanelOpen, setView, setActiveTab, theme } = useAppStore()
  const { saveItem } = useFeedStore()
  const { fetchProjects } = useProjectStore()
  const [projectSelectorOpen, setProjectSelectorOpen] = useState(false)
  const [draggedItemTitle, setDraggedItemTitle] = useState<string | null>(null)
  const [pendingSaveItemId, setPendingSaveItemId] = useState<string | null>(null)

  // Initialize Projects
  React.useEffect(() => {
    fetchProjects()
  }, [])

  // Theme Effect
  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)

      // Listener for system changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        const newTheme = mediaQuery.matches ? 'dark' : 'light'
        root.classList.remove('light', 'dark')
        root.classList.add(newTheme)
      }
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      root.classList.add(theme)
      return undefined
    }
  }, [theme])

  const showTabBar = tabs.length > 0

  // Dnd Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  )

  // 全域快捷鍵：Ctrl+1~4 切換視圖
  useHotkeys(
    'ctrl+1',
    (e) => {
      e.preventDefault()
      setActiveTab(null)
      setView('dashboard')
    },
    { enableOnFormTags: true }
  )

  useHotkeys(
    'ctrl+2',
    (e) => {
      e.preventDefault()
      setActiveTab(null)
      setView('feed')
    },
    { enableOnFormTags: true }
  )

  useHotkeys(
    'ctrl+3',
    (e) => {
      e.preventDefault()
      setActiveTab(null)
      setView('library')
    },
    { enableOnFormTags: true }
  )

  useHotkeys(
    'ctrl+4',
    (e) => {
      e.preventDefault()
      setActiveTab(null)
      setView('project')
    },
    { enableOnFormTags: true }
  )

  React.useEffect(() => {
    const handleOpenSelector = (e: CustomEvent<{ itemId: string }>) => {
      setPendingSaveItemId(e.detail.itemId)
      setProjectSelectorOpen(true)
    }
    window.addEventListener('open-project-selector' as any, handleOpenSelector)
    return () => window.removeEventListener('open-project-selector' as any, handleOpenSelector)
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.title) {
      setDraggedItemTitle(active.data.current.title as string)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedItemTitle(null)

    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    // Feed Item -> Project
    if (activeId.startsWith('feed-item-')) {
      const itemId = activeId.replace('feed-item-', '')

      // 拖曳到 Sidebar 的 "Project" 圖標 -> 開啟選擇器
      if (overId === 'nav-project') {
        setPendingSaveItemId(itemId)
        setProjectSelectorOpen(true)
      }
      // 拖曳到具體專案 -> 直接加入
      else if (overId.startsWith('project-')) {
        const projectId = overId.replace('project-', '')
        console.log(`[Drag] Adding item ${itemId} to project ${projectId}`)

        // Save item and get note ID
        const noteId = await saveItem(itemId)

        if (noteId) {
          try {
            await window.api.project.addItem(projectId, noteId)
            console.log(`[Drag] Item added to project ${projectId}`)
            useToastStore.getState().addToast({
              type: 'success',
              title: 'Item added to project',
            })
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error)
            useToastStore.getState().addToast({
              type: 'error',
              title: 'Failed to add item to project',
              description: msg
            })
            console.error('Failed to add item to project:', error)
          }
        }
      }
    }
  }

  const handleProjectSelect = async (projectId: string) => {
    if (pendingSaveItemId) {
      console.log(`[Selector] Adding item ${pendingSaveItemId} to project ${projectId}`)
      const noteId = await saveItem(pendingSaveItemId)
      if (noteId) {
        try {
          await window.api.project.addItem(projectId, noteId)
          console.log(`[Selector] Item added to project ${projectId}`)
          useToastStore.getState().addToast({
            type: 'success',
            title: 'Item added to project',
          })
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error)
          useToastStore.getState().addToast({
            type: 'error',
            title: 'Failed to add item to project',
            description: msg
          })
          console.error('Failed to add item to project:', error)
        }
      }
    }
    setPendingSaveItemId(null)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className="flex h-screen w-screen overflow-hidden text-sm bg-background text-foreground"
      >
        {/* 側邊導航 */}
        <div className="flex-none h-full z-50">
          <Sidebar />
        </div>

        {/* 主內容區 */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative z-0">
          {/* Tab Bar (if visible) */}
          {showTabBar && (
            <div className="flex-none z-10">
              <TabBar />
            </div>
          )}

          {/* Content View */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
            <MainContent />
          </div>
        </div>

        {/* 輔助面板 (右側) */}
        {auxPanelOpen && <AuxPanel />}

        {/* 專案選擇器 Modal */}
        <ProjectSelectorDialog
          isOpen={projectSelectorOpen}
          onClose={() => setProjectSelectorOpen(false)}
          onSelect={handleProjectSelect}
        />

        {/* Drag Overlay (Optional visual feedback) */}
        <DragOverlay>
          {draggedItemTitle ? (
            <div className="bg-zinc-800 text-white p-3 rounded shadow-xl border border-white/10 opacity-90 w-[300px] truncate pointer-events-none">
              {draggedItemTitle}
            </div>
          ) : null}
        </DragOverlay>
        <Toaster />
      </div>
    </DndContext>
  )
}
