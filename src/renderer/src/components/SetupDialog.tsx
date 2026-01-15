import React, { useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { tokens } from '../styles/tokens'
import { useToastStore } from '@/stores/toast.store'

interface Props {
  onComplete: () => void
}

export const SetupDialog: React.FC<Props> = ({ onComplete }) => {
  const [selectedPath, setSelectedPath] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleSelect = async () => {
    try {
      setLoading(true)
      const path = await window.api.settings.selectDirectory()
      if (path) {
        setSelectedPath(path)
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to select directory',
        description: msg
      })
      console.error('Failed to select directory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!selectedPath) return
    try {
      setLoading(true)
      await window.api.settings.set('notes.rootDir', selectedPath)
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Settings saved',
        description: 'Knowledge base root directory configured'
      })
      onComplete()
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to save settings',
        description: msg
      })
      console.error('Failed to save settings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div
        className="w-full max-w-lg p-8 rounded-2xl shadow-2xl border"
        style={{ backgroundColor: tokens.colors.bgElevated, borderColor: tokens.colors.bgSubtle }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <FolderOpen size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-foreground">歡迎使用 Thinkrium</h1>
          <p className="text-muted-foreground">
            為了開始使用，請選擇一個資料夾作為您的知識庫根目錄。
            <br />
            所有的 RSS 文章和筆記都將存儲在這個目錄中。
          </p>
        </div>

        <div className="space-y-6">
          <div
            className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            style={{ borderColor: tokens.colors.bgSubtle }}
            onClick={handleSelect}
          >
            {selectedPath ? (
              <>
                <div className="font-mono text-sm break-all text-center px-4 bg-muted py-2 rounded">
                  {selectedPath}
                </div>
                <span className="text-xs text-primary font-bold uppercase tracking-wider">
                  更換目錄
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-bold text-foreground">點擊選擇目錄</span>
                <span className="text-xs text-muted-foreground">
                  (建議選擇一個空的資料夾或您現有的 Obsidian Vault)
                </span>
              </>
            )}
          </div>

          <button
            disabled={!selectedPath || loading}
            onClick={handleConfirm}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {loading ? '設定中...' : '開始使用'}
          </button>
        </div>
      </div>
    </div>
  )
}
