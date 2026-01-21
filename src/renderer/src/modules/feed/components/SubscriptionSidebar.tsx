import React, { useState, useEffect } from 'react'
import { Plus, ListFilter, Trash2, MoreHorizontal, FileUp, FileDown, FolderPlus } from 'lucide-react'
import { useFeedStore } from '../store/feed.store'
import { cn } from '@/lib/utils'
import { AddSubscriptionDialog } from './AddSubscriptionDialog'
import { ImportOpmlDialog } from './ImportOpmlDialog'
import { MoveSubscriptionDialog } from './MoveSubscriptionDialog'
import { FolderNode } from './FolderNode'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@radix-ui/react-dropdown-menu'

import { CreateFolderDialog } from './CreateFolderDialog'

export const SubscriptionSidebar: React.FC = () => {
  const {
    subscriptions,
    folders,
    activeSubscriptionId,
    activeFolderId,
    setActiveSubscription,
    removeFeed,
    exportOpml,
    fetchSubscriptions,
    fetchFolders,
    createFolder,
    renameFolder,
    deleteFolder,
    moveFeedToFolder
  } = useFeedStore()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false)
  const [moveDialogState, setMoveDialogState] = useState<{ isOpen: boolean; subscriptionId: string | null }>({
    isOpen: false,
    subscriptionId: null
  })

  // Initial fetch
  useEffect(() => {
    fetchFolders()
    fetchSubscriptions() // this also fetches folders currently in store implementation but safe to call
  }, [])

  // Root folders (parent_id is null)
  const rootFolders = folders
    .filter((f) => !f.parent_id)
    .sort((a, b) => a.position - b.position)

  // Root subscriptions (folder_id is null)
  const rootSubscriptions = subscriptions
    .filter((s) => !s.folder_id)
    .sort((a, b) => a.name.localeCompare(b.name))

  const handleDeleteFeed = async (e: React.MouseEvent, id: string): Promise<void> => {
    e.stopPropagation()
    if (confirm('確定要刪除這個訂閱源嗎？')) {
      await removeFeed(id)
    }
  }


  return (
    <div className="h-full flex flex-col bg-card border-border select-none">
      <div className="p-4 flex items-center justify-between border-b border-border">
        <span className="font-bold text-xs uppercase text-muted-foreground tracking-wider">
          訂閱源
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreateFolderDialogOpen(true)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-muted-foreground transition-colors"
            title="新增資料夾"
          >
            <FolderPlus size={18} />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-muted-foreground transition-colors"
                title="更多選項"
                data-testid="more-options-button"
              >
                <MoreHorizontal size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
              align="end"
            >
              <DropdownMenuItem
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onClick={() => setIsImportDialogOpen(true)}
              >
                <FileUp className="mr-2 h-4 w-4" />
                <span>匯入 OPML</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onClick={() => exportOpml()}
              >
                <FileDown className="mr-2 h-4 w-4" />
                <span>匯出 OPML</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-primary transition-colors"
            title="新增訂閱"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <button
          onClick={() => setActiveSubscription(null)}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors',
            activeSubscriptionId === null && activeFolderId === null
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
          )}
        >
          <ListFilter size={18} />
          <span>全部項目</span>
        </button>

        {/* Folder Tree */}
        <div className="mt-2">
          {rootFolders.map(folder => (
            <FolderNode
              key={folder.id}
              folder={folder}
              depth={0}
              allFolders={folders}
              allSubscriptions={subscriptions}
              onRename={renameFolder}
              onDelete={deleteFolder}
              onCreateSubfolder={createFolder}
              onMoveFeed={(id, folderId) => {
                if (folderId === null) moveFeedToFolder(id, null)
                else setMoveDialogState({ isOpen: true, subscriptionId: id })
              }}
            />
          ))}
        </div>

        {/* Root Subscriptions */}
        <div className="mt-2">
          {rootSubscriptions.map((sub) => (
            <div
              key={sub.id}
              className={cn(
                'flex items-center justify-between px-2 py-1.5 text-sm transition-colors cursor-pointer group rounded-sm mx-2',
                activeSubscriptionId === sub.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
              )}
              // Root items indent same as folders (depth 0, padding 8px) + icon space
              style={{ paddingLeft: '8px' }}
              onClick={() => setActiveSubscription(sub.id)}
            >
              <div className="flex items-center gap-3 truncate flex-1 min-w-0">
                {sub.icon_url ? (
                  <img src={sub.icon_url} className="w-4 h-4 rounded-sm" />
                ) : (
                  <div className="w-4 h-4 rounded-sm bg-muted shrink-0" />
                )}
                <span className="truncate">{sub.name}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {sub.unreadCount > 0 && (
                  <span className="text-xs bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary min-w-[20px] text-center">
                    {sub.unreadCount}
                  </span>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded text-muted-foreground transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="z-50 min-w-[10rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                    align="end"
                  >
                    <DropdownMenuItem
                      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMoveDialogState({ isOpen: true, subscriptionId: sub.id })
                      }}
                    >
                      <FolderPlus className="mr-2 h-4 w-4" />
                      <span>Move to...</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-destructive focus:text-destructive-foreground"
                      onClick={(e) => handleDeleteFeed(e, sub.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddSubscriptionDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} />
      <ImportOpmlDialog isOpen={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} />
      <CreateFolderDialog isOpen={isCreateFolderDialogOpen} onClose={() => setIsCreateFolderDialogOpen(false)} />
      {moveDialogState.subscriptionId && (
        <MoveSubscriptionDialog
          isOpen={moveDialogState.isOpen}
          onClose={() => setMoveDialogState({ ...moveDialogState, isOpen: false })}
          subscriptionId={moveDialogState.subscriptionId}
        />
      )}
    </div>
  )
}
