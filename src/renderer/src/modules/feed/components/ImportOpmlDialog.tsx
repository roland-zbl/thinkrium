import React, { useState } from 'react'
import { Upload, X, Check, AlertTriangle, FileUp } from 'lucide-react'
import { invokeIPC } from '@/utils/ipc'
import { useFeedStore } from '../store/feed.store'

interface ImportOpmlDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface ImportResult {
  added: number
  skipped: number
  errors: string[]
}

export const ImportOpmlDialog: React.FC<ImportOpmlDialogProps> = ({ isOpen, onClose }) => {
  const [filePath, setFilePath] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const { importOpml } = useFeedStore()

  if (!isOpen) return null

  const handleSelectFile = async () => {
    try {
      const path = await invokeIPC(
        window.api.dialog.openFile({
          filters: [{ name: 'OPML Files', extensions: ['opml', 'xml'] }]
        })
      )
      if (path) {
        setFilePath(path)
        setResult(null) // Reset result on new file selection
      }
    } catch (error) {
      console.error('Failed to select file:', error)
    }
  }

  const handleImport = async () => {
    if (!filePath) return

    setIsImporting(true)
    try {
      const importResult = await importOpml(filePath)
      setResult(importResult || null)
    } catch (error) {
      console.error('Import failed:', error)
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setFilePath(null)
    setResult(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg w-[500px] max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Upload size={20} />
            匯入 OPML
          </h2>
          <button onClick={handleClose} className="p-1 hover:bg-muted rounded">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-auto">
          {!result ? (
            <div className="space-y-6">
              <div
                className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={handleSelectFile}
              >
                <FileUp size={48} className="text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">點擊選擇 OPML 檔案</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    支援 .opml 或 .xml 格式
                  </p>
                </div>
              </div>

              {filePath && (
                <div className="bg-muted/30 p-3 rounded text-sm flex items-center gap-2 break-all">
                   <span className="font-bold shrink-0">已選取:</span>
                   {filePath}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-500 font-bold text-lg">
                <Check size={24} />
                匯入完成
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/30 p-3 rounded text-center">
                  <div className="text-2xl font-bold">{result.added}</div>
                  <div className="text-xs text-muted-foreground">新增訂閱</div>
                </div>
                <div className="bg-muted/30 p-3 rounded text-center">
                  <div className="text-2xl font-bold">{result.skipped}</div>
                  <div className="text-xs text-muted-foreground">跳過重複</div>
                </div>
                <div className="bg-muted/30 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-red-500">{result.errors.length}</div>
                  <div className="text-xs text-muted-foreground">失敗</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-sm max-h-[150px] overflow-auto">
                  <div className="font-bold flex items-center gap-2 mb-2 text-red-500">
                    <AlertTriangle size={14} />
                    錯誤詳情
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-red-500/80">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2">
          {!result ? (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm hover:bg-muted rounded"
                disabled={isImporting}
              >
                取消
              </button>
              <button
                onClick={handleImport}
                disabled={!filePath || isImporting}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isImporting ? '匯入中...' : '開始匯入'}
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              完成
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
