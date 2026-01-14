import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (title: string) => void
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  onOpenChange,
  onConfirm
}) => {
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (title.trim()) {
      onConfirm(title.trim())
      setTitle('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>建立新專案</DialogTitle>
          <DialogDescription>請輸入專案名稱以開始新的創作。</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="name"
                placeholder="專案名稱..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              建立專案
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
