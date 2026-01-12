import React from 'react'
import { X, LayoutList, Link as LinkIcon, Bot } from 'lucide-react'
import { useAppStore } from '../../stores/app.store'
import { tokens } from '../../styles/tokens'
import { cn } from '../../lib/utils'

const TABS = [
  { id: 'outline', label: '大綱', icon: LayoutList },
  { id: 'backlinks', label: '雙鏈', icon: LinkIcon },
  { id: 'ai', label: 'AI', icon: Bot }
] as const

export const AuxPanel: React.FC = () => {
  const { auxPanelTab, setAuxPanelTab, setAuxPanelOpen } = useAppStore()

  return (
    <div
      className="w-[280px] border-l flex flex-col h-full overflow-hidden"
      style={{
        backgroundColor: tokens.colors.bgElevated,
        borderColor: tokens.colors.bgSubtle
      }}
    >
      {/* Tab 切換 */}
      <div className="flex border-b" style={{ borderColor: tokens.colors.bgSubtle }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAuxPanelTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center py-2 gap-2 hover:bg-accent transition-colors',
              auxPanelTab === tab.id
                ? 'text-primary border-b-2 border-b-primary'
                : 'text-muted-foreground'
            )}
          >
            <tab.icon size={16} />
          </button>
        ))}
        <button
          className="p-2 hover:bg-accent text-muted-foreground"
          onClick={() => setAuxPanelOpen(false)}
        >
          <X size={16} />
        </button>
      </div>

      {/* 內容區 */}
      <div className="flex-1 p-4 overflow-auto">
        {auxPanelTab === 'outline' && <div className="text-muted-foreground">目前無大綱內容</div>}
        {auxPanelTab === 'backlinks' && <div className="text-muted-foreground">目前無關聯項目</div>}
        {auxPanelTab === 'ai' && (
          <div className="space-y-4">
            <div className="text-xs text-foreground/60 bg-black/5 dark:bg-white/5 p-3 rounded-md border border-border">
              我是您的 AI 助理，需要幫您分析當前內容嗎？
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
