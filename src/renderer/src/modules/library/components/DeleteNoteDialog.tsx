import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLibraryStore } from '../store/library.store'

interface DeleteNoteDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export const DeleteNoteDialog: React.FC<DeleteNoteDialogProps> = ({ isOpen, onOpenChange }) => {
  const { selectedNoteId, activeNote, deleteNote } = useLibraryStore()
  const noteTitle = activeNote?.title || '此筆記'

  const handleDelete = async () => {
    if (selectedNoteId) {
      await deleteNote(selectedNoteId)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>刪除筆記</DialogTitle>
          <DialogDescription>
            確定要刪除 "{noteTitle}" 嗎？此動作無法復原。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            確認刪除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
