import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Folder as FolderIcon } from 'lucide-react'
import { useFeedStore } from '../store/feed.store'
import { Folder } from '@/types'

interface MoveSubscriptionDialogProps {
  isOpen: boolean
  onClose: () => void
  subscriptionId: string
}

export const MoveSubscriptionDialog: React.FC<MoveSubscriptionDialogProps> = ({
  isOpen,
  onClose,
  subscriptionId
}) => {
  const { folders, moveFeedToFolder } = useFeedStore()

  // Flatten folders with depth
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

  const handleMove = async (folderId: string | null) => {
    await moveFeedToFolder(subscriptionId, folderId)
    onClose()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
              Move to Folder
            </Dialog.Title>
          </div>

          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto py-2">
            <button
               onClick={() => handleMove(null)}
               className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left"
            >
                <div className="w-4 h-4" />
                <span>(Root)</span>
            </button>

            {flattenedFolders.map(({ folder, depth }) => (
              <button
                key={folder.id}
                onClick={() => handleMove(folder.id)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left truncate"
              >
                 <div style={{ width: `${depth * 16}px` }} className="shrink-0" />
                 <FolderIcon size={16} className="text-muted-foreground shrink-0" />
                 <span className="truncate">{folder.name}</span>
              </button>
            ))}

            {flattenedFolders.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-4">
                    No folders created yet.
                </div>
            )}
          </div>

          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
