import React, { useState, useEffect } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Folder as FolderIcon,
  FolderOpen,
  MoreHorizontal,
  Edit2,
  Trash2,
  Plus
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuPortal
} from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'
import { useFeedStore, Subscription } from '../store/feed.store'
import { Folder } from '@/types'

interface FolderNodeProps {
  folder: Folder
  depth: number
  allFolders: Folder[]
  allSubscriptions: Subscription[]
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onCreateSubfolder: (name: string, parentId: string) => void
  onMoveFeed: (feedId: string, folderId: string | null) => void
  onEdit: (feedId: string) => void
}

export const FolderNode: React.FC<FolderNodeProps> = ({
  folder,
  depth,
  allFolders,
  allSubscriptions,
  onRename,
  onDelete,
  onCreateSubfolder,
  onMoveFeed,
  onEdit
}) => {
  const { activeFolderId, setActiveFolder, activeSubscriptionId, setActiveSubscription } =
    useFeedStore()

  const [isOpen, setIsOpen] = useState(() => {
    const savedState = localStorage.getItem(`folder-${folder.id}-open`)
    return savedState === 'true'
  })

  useEffect(() => {
    localStorage.setItem(`folder-${folder.id}-open`, String(isOpen))
  }, [isOpen, folder.id])

  const childFolders = allFolders
    .filter((f) => f.parent_id === folder.id)
    .sort((a, b) => a.position - b.position)

  const childSubscriptions = allSubscriptions
    .filter((s) => s.folder_id === folder.id)
    .sort((a, b) => a.name.localeCompare(b.name))

  const getUnreadCount = (folderId: string): number => {
    const subs = allSubscriptions.filter((s) => s.folder_id === folderId)
    const subCount = subs.reduce((acc, curr) => acc + curr.unreadCount, 0)

    const children = allFolders.filter((f) => f.parent_id === folderId)
    const childrenCount = children.reduce((acc, curr) => acc + getUnreadCount(curr.id), 0)

    return subCount + childrenCount
  }

  const unreadCount = getUnreadCount(folder.id)
  const isActive = activeFolderId === folder.id

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveFolder(folder.id)
  }

  return (
    <div className="select-none">
      <div
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleSelect(e as any)
          }
        }}
        className={cn(
          'flex items-center justify-between px-2 py-1.5 text-sm transition-colors duration-150 cursor-pointer group rounded-sm mx-2',
          isActive
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-foreground/80 hover:bg-muted/50 hover:text-foreground'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleSelect}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={handleToggle}
            className="p-0.5 hover:bg-muted rounded transition-colors"
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          <div className="flex items-center gap-2 truncate">
            {isOpen ? (
              <FolderOpen size={16} className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
            ) : (
              <FolderIcon size={16} className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
            )}
            <span className="truncate">{folder.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {unreadCount > 0 && (
            <span className="text-xs bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary min-w-[20px] text-center">
              {unreadCount}
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
            <DropdownMenuPortal>
              <DropdownMenuContent
                className="z-50 min-w-[10rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                align="start"
              >
                <DropdownMenuItem
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    const name = prompt('Enter new name:', folder.name)
                    if (name && name !== folder.name) onRename(folder.id, name)
                  }}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    const name = prompt('Enter subfolder name:')
                    if (name) onCreateSubfolder(name, folder.id)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>New Subfolder</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 h-px bg-muted" />

                <DropdownMenuItem
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-destructive focus:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Are you sure you want to delete this folder? Subscriptions will be moved to root.')) onDelete(folder.id)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </div>
      </div>

      {isOpen && (
        <div>
          {childFolders.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              depth={depth + 1}
              allFolders={allFolders}
              allSubscriptions={allSubscriptions}
              onRename={onRename}
              onDelete={onDelete}
              onCreateSubfolder={onCreateSubfolder}
              onMoveFeed={onMoveFeed}
              onEdit={onEdit}
            />
          ))}
          {childSubscriptions.map((sub) => (
            <div
              key={sub.id}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  setActiveSubscription(sub.id)
                }
              }}
              className={cn(
                'flex items-center justify-between px-2 py-1.5 text-sm transition-colors duration-150 cursor-pointer group rounded-sm mx-2',
                activeSubscriptionId === sub.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground/80 hover:bg-muted/50 hover:text-foreground'
              )}
              style={{ paddingLeft: `${(depth + 1) * 12 + 24}px` }}
              onClick={(e) => {
                e.stopPropagation()
                setActiveSubscription(sub.id)
              }}
            >
              <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                {sub.icon_url ? (
                  <img src={sub.icon_url} className="w-4 h-4 rounded-sm" />
                ) : (
                  <div className="w-4 h-4 rounded-sm bg-muted shrink-0" />
                )}
                <span className="truncate">{sub.name}</span>
              </div>
              {sub.unreadCount > 0 && (
                <span className="text-xs bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary min-w-[20px] text-center shrink-0">
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
                  align="start"
                >
                  <DropdownMenuItem
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(sub.id)
                    }}
                  >
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMoveFeed(sub.id, null) // Move to root
                    }}
                  >
                    <span>Move to Root</span>
                  </DropdownMenuItem>
                  {/* Simple "Move to..." logic could be complex (submenu for folders).
                          For MVP, maybe just "Move to Root" is enough if D&D is optional?
                          Or we can list top-level folders?
                          Let's stick to simple "Move to Root" here and rely on D&D or better UI later
                          or implement a simple selector if requested.
                          Task 4.2.2 says: "訂閱右鍵選單：移動到資料夾"
                          This implies selecting a folder.
                          Ideally, we show a dialog or a submenu.
                      */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
