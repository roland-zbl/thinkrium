import React, { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { tokens } from '@/styles/tokens'
import { useFeedStore } from '../store/feed.store'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const AddSubscriptionDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  // State for form inputs
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('未分類')

  if (!isOpen) return null

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
    } catch (err: any) {
      console.error('Failed to add subscription:', err)
      setError(err.message || '新增訂閱失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border shadow-2xl flex flex-col overflow-hidden"
        style={{ backgroundColor: tokens.colors.bgElevated, borderColor: tokens.colors.bgSubtle }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: tokens.colors.bgSubtle }}
        >
          <h2 className="font-bold text-foreground">新增 RSS 訂閱</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

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
              <AlertCircle size={16} />
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
      </div>
    </div>
  )
}
