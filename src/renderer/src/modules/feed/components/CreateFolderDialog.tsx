import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFeedStore } from '../store/feed.store'

interface CreateFolderDialogProps {
    isOpen: boolean
    onClose: () => void
}

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('')
    const { createFolder } = useFeedStore()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            createFolder(name.trim())
            setName('')
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>建立新資料夾</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="資料夾名稱"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            取消
                        </Button>
                        <Button type="submit">建立</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
