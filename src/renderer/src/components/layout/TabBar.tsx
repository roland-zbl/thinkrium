import React, { useState } from 'react'
import { X, FileText, FolderKanban } from 'lucide-react'
import { useAppStore, Tab } from '../../stores/app.store'
import { tokens } from '../../styles/tokens'
import { cn } from '../../lib/utils'

// 確認對話框組件
const ConfirmDialog: React.FC<{
  isOpen: boolean
  title: string
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
}> = ({ isOpen, title, onSave, onDiscard, onCancel }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-xl border shadow-2xl p-6"
        style={{ backgroundColor: tokens.colors.bgElevated, borderColor: tokens.colors.bgSubtle }}
      >
        <h3 className="font-bold text-lg mb-2 text-foreground">未保存的變更</h3>
        <p className="text-sm text-muted-foreground mb-6">「{title}」有未保存的變更，是否保存？</p>
        <div className="flex gap-3">
          <button
            onClick={onDiscard}
            className="flex-1 py-2 text-sm font-medium hover:bg-accent rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            不保存
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-sm font-medium hover:bg-accent rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            取消
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-2 text-sm font-bold bg-primary hover:bg-primary/80 text-white rounded-lg"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useAppStore()
  const [confirmClose, setConfirmClose] = useState<{ open: boolean; tab: Tab | null }>({
    open: false,
    tab: null
  })

  const handleClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    const tab = tabs.find((t) => t.id === tabId)

    if (tab?.isDirty) {
      setConfirmClose({ open: true, tab })
    } else {
      closeTab(tabId)
    }
  }

  const handleSave = () => {
    if (confirmClose.tab) {
      // TODO: 實際保存邏輯
      console.log('[TabBar] Saving tab:', confirmClose.tab.id)
      closeTab(confirmClose.tab.id)
    }
    setConfirmClose({ open: false, tab: null })
  }

  const handleDiscard = () => {
    if (confirmClose.tab) {
      closeTab(confirmClose.tab.id)
    }
    setConfirmClose({ open: false, tab: null })
  }

  const handleCancel = () => {
    setConfirmClose({ open: false, tab: null })
  }

  return (
    <>
      <div
        className="flex h-10 border-b overflow-x-auto no-scrollbar"
        style={{
          backgroundColor: tokens.colors.bgElevated,
          borderColor: tokens.colors.bgSubtle
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id
          const Icon = tab.type === 'editor' ? FileText : FolderKanban

          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'group relative flex items-center h-full px-4 gap-2 border-r min-w-[120px] max-w-[240px] cursor-pointer transition-colors text-xs select-none',
                isActive
                  ? 'bg-background text-primary border-b-2 border-b-primary font-bold'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground border-b-transparent'
              )}
              style={{ borderColor: tokens.colors.bgSubtle }}
            >
              <Icon
                size={14}
                className={cn(isActive ? 'text-primary' : 'text-muted-foreground/40')}
              />
              <span className="truncate flex-1">{tab.title}</span>
              {tab.isDirty && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
              <button
                onClick={(e) => handleClose(e, tab.id)}
                className={cn(
                  'p-0.5 rounded-sm hover:bg-black/5 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity',
                  isActive && 'opacity-100'
                )}
              >
                <X size={12} />
              </button>
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        isOpen={confirmClose.open}
        title={confirmClose.tab?.title || ''}
        onSave={handleSave}
        onDiscard={handleDiscard}
        onCancel={handleCancel}
      />
    </>
  )
}
