import React, { useState } from 'react'
import { Check, Trash2, MessageSquare, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HighlightColor } from '@/types'

interface HighlightToolbarProps {
  position: { top: number; left: number } | null
  onColorSelect: (color: HighlightColor) => void
  onAddNote?: () => void
  onClose: () => void
}

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  position,
  onColorSelect,
  onAddNote,
  onClose
}) => {
  if (!position) return null

  const colors: { name: HighlightColor; bg: string }[] = [
    { name: 'yellow', bg: 'bg-yellow-300' },
    { name: 'green', bg: 'bg-green-300' },
    { name: 'blue', bg: 'bg-blue-300' },
    { name: 'pink', bg: 'bg-pink-300' }
  ]

  return (
    <div
      className="fixed z-50 flex items-center gap-1 p-1 bg-popover text-popover-foreground rounded-lg shadow-md border border-border animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, -100%) translateY(-8px)'
      }}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing focus/selection
    >
      {colors.map((c) => (
        <button
          key={c.name}
          onClick={() => onColorSelect(c.name)}
          className={cn(
            'w-6 h-6 rounded-full hover:scale-110 transition-transform border border-black/10',
            c.bg
          )}
          title={`Highlight ${c.name}`}
        />
      ))}
      <div className="w-px h-4 bg-border mx-1" />
      {onAddNote && (
        <button
          onClick={onAddNote}
          className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Add Note"
        >
          <MessageSquare size={16} />
        </button>
      )}
      <button
        onClick={onClose}
        className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
        title="Close"
      >
        <X size={16} />
      </button>
    </div>
  )
}

interface HighlightMenuProps {
    position: { top: number; left: number } | null
    note: string | null
    color: HighlightColor
    onUpdateColor: (color: HighlightColor) => void
    onUpdateNote: (note: string) => void
    onDelete: () => void
    onClose?: () => void
}

export const HighlightMenu: React.FC<HighlightMenuProps> = ({
    position,
    note,
    color,
    onUpdateColor,
    onUpdateNote,
    onDelete,
}) => {
    if (!position) return null

    const [isEditingNote, setIsEditingNote] = useState(!!note)
    const [noteText, setNoteText] = useState(note || '')

    const colors: { name: HighlightColor; bg: string }[] = [
        { name: 'yellow', bg: 'bg-yellow-300' },
        { name: 'green', bg: 'bg-green-300' },
        { name: 'blue', bg: 'bg-blue-300' },
        { name: 'pink', bg: 'bg-pink-300' }
      ]

    return (
        <div
          className="fixed z-50 flex flex-col gap-2 p-2 bg-popover text-popover-foreground rounded-lg shadow-lg border border-border min-w-[200px] animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: position.top,
            left: position.left,
            transform: 'translate(-50%, 10px)'
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
           {/* Color Picker */}
           <div className="flex items-center gap-2 justify-center">
             {colors.map((c) => (
                <button
                key={c.name}
                onClick={() => onUpdateColor(c.name)}
                className={cn(
                    'w-6 h-6 rounded-full hover:scale-110 transition-transform border border-black/10 flex items-center justify-center',
                    c.bg
                )}
                >
                    {color === c.name && <Check size={12} className="text-black/70" />}
                </button>
             ))}
             <div className="flex-1" />
             <button
                onClick={onDelete}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded transition-colors"
                title="Remove Highlight"
             >
                <Trash2 size={16} />
             </button>
           </div>

           {/* Note Section */}
           <div className="border-t border-border pt-2 mt-1">
                {isEditingNote ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add a note..."
                            className="w-full text-sm bg-muted/50 rounded p-2 border border-border focus:outline-none focus:border-primary resize-none min-h-[60px]"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                             <button
                                onClick={() => {
                                    setIsEditingNote(false)
                                    setNoteText(note || '') // Revert
                                }}
                                className="text-xs text-muted-foreground hover:text-foreground"
                             >
                                Cancel
                             </button>
                             <button
                                onClick={() => {
                                    onUpdateNote(noteText)
                                    setIsEditingNote(!!noteText)
                                }}
                                className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
                             >
                                Save
                             </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => setIsEditingNote(true)}
                        className="text-sm text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded hover:bg-muted/50 min-h-[24px]"
                    >
                        {note ? note : <span className="italic opacity-50 flex items-center gap-1"><MessageSquare size={12}/> Add a note...</span>}
                    </div>
                )}
           </div>
        </div>
    )
}
