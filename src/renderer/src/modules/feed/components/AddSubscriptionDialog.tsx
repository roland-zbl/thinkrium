import React, { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { tokens } from '../../../styles/tokens'
import { useFeedStore } from '../store/feed.store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../../../components/ui/dialog'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const AddSubscriptionDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  // State for form inputs
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('未分類')

  const { addFeed } = useFeedStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await addFeed(url, name || undefined, category)
      onClose()
      // Reset form after successful submission
      setUrl('')
      setName('')
      setCategory('未分類')
    } catch (err: any) {
      console.error('Failed to add subscription:', err)
      setError(err.message || '新增訂閱失敗')
    } finally {
      setLoading(false)
    }
  }

  // Handle open change to reset state if needed when closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      // Optional: reset state on close
      setError(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-md border shadow-2xl gap-0" style={{ backgroundColor: tokens.colors.bgElevated }}>
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0" style={{ borderColor: tokens.colors.bgSubtle }}>
          <DialogTitle className="font-bold text-foreground">新增 RSS 訂閱</DialogTitle>
          <DialogClose asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <X size={18} aria-hidden="true" />
              <span className="sr-only">Close</span>
            </button>
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">RSS URL *</label>
            <input
              autoFocus
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/feed.xml"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">
              顯示名稱 (選填)
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="留空將自動抓取"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">分類</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 appearance-none text-foreground"
            >
              <option value="未分類">未分類</option>
              <option value="遊戲媒體">遊戲媒體</option>
              <option value="開發者">開發者</option>
              <option value="個人博客">個人博客</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors border border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 text-sm font-bold bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '驗證中...' : '確認新增'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
