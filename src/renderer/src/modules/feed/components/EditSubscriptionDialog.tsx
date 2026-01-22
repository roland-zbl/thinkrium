import React, { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { useFeedStore } from '../store/feed.store'
import { Folder } from '@/types'

interface EditSubscriptionDialogProps {
  isOpen: boolean
  onClose: () => void
  subscriptionId: string
}

export const EditSubscriptionDialog: React.FC<EditSubscriptionDialogProps> = ({
  isOpen,
  onClose,
  subscriptionId
}) => {
  const { subscriptions, folders, updateSubscription } = useFeedStore()
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [folderId, setFolderId] = useState<string>('root')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subscription = subscriptions.find((s) => s.id === subscriptionId)

  useEffect(() => {
    if (isOpen && subscription) {
      setUrl(subscription.url)
      setName(subscription.name)
      setFolderId(subscription.folder_id || 'root')
    }
  }, [isOpen, subscription?.id])

  if (!isOpen || !subscription) return null

  // Flatten folders for the select dropdown, showing hierarchy
  const getFlattenedFolders = (parentId: string | null = null, depth = 0): { folder: Folder, depth: number }[] => {
    const children = folders
      .filter(f => f.parent_id === parentId)
      .sort((a, b) => a.position - b.position)

    let result: { folder: Folder, depth: number }[] = []

    for (const child of children) {
      result.push({ folder: child, depth })
      result = [...result, ...getFlattenedFolders(child.id, depth + 1)]
    }

    return result
  }

  const flattenedFolders = getFlattenedFolders()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await updateSubscription(subscriptionId, {
        title: name,
        url: url,
        folder_id: folderId === 'root' ? null : folderId
      })
      onClose()
    } catch (err: unknown) {
      // Error handling is also done in store, but we might want to show it in the form
      // The store shows a toast. Here we can show inline error too.
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to update subscription')
      }
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
        className="w-full max-w-md rounded-xl border shadow-2xl flex flex-col overflow-hidden bg-card border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-foreground">編輯訂閱</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">名稱</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">RSS URL</label>
            <input
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">資料夾</label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 appearance-none text-foreground"
            >
              <option value="root">(Root)</option>
              {flattenedFolders.map(({ folder, depth }) => (
                <option key={folder.id} value={folder.id}>
                  {'\u00A0'.repeat(depth * 4)}{folder.name}
                </option>
              ))}
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
              {loading ? '更新中...' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
