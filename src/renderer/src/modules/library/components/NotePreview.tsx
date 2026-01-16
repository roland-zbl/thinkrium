import React from 'react'
import { Edit3, FolderPlus, X, FileText, Share2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useLibraryStore } from '../store/library.store'
import { useAppStore } from '@/stores/app.store'
import { tokens } from '@/styles/tokens'

export const NotePreview: React.FC = () => {
  const { selectedNoteId, notes, activeNote, selectNote } = useLibraryStore()
  const { addTab } = useAppStore()

  // Prefer activeNote (full details) if available and matching selected ID,
  // otherwise fallback to note from list (summary)
  const note = (activeNote && activeNote.id === selectedNoteId)
    ? activeNote
    : notes.find((n) => n.id === selectedNoteId)

  if (!note) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-white/40 dark:bg-black/20 backdrop-blur">
        <FileText size={48} className="mb-4 opacity-20" />
        <span className="text-sm font-medium">選擇筆記查看預覽</span>
      </div>
    )
  }

  return (
    <div
      className="h-full flex flex-col border-l relative"
      style={{ backgroundColor: tokens.colors.bgElevated, borderColor: tokens.colors.bgSubtle }}
    >
      {/* 工具欄 */}
      <div
        className="h-12 border-b flex items-center justify-between px-6 shrink-0"
        style={{ borderColor: tokens.colors.bgSubtle }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => selectNote(null)}
            className="hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
            筆記詳情
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className="p-2 hover:text-primary text-muted-foreground transition-colors tooltip"
            title="分享"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={() =>
              addTab({
                id: note.id,
                type: 'editor',
                title: note.title,
                data: { noteId: note.id }
              })
            }
            className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary text-xs px-3 py-1.5 rounded transition-colors font-bold"
          >
            <Edit3 size={14} />
            編輯
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 space-y-6">
        <h1 className="text-2xl font-bold text-foreground leading-tight">{note.title}</h1>

        <div
          className="flex items-center gap-4 text-xs text-muted-foreground pb-6 border-b"
          style={{ borderColor: tokens.colors.bgSubtle }}
        >
          <div className="flex items-center gap-1">
            <span>日期:</span>
            <span className="text-muted-foreground">{note.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>類型:</span>
            <span className="bg-white/5 px-2 py-0.5 rounded text-muted-foreground capitalize">
              {note.type}
            </span>
          </div>
        </div>

        <div className="py-6 space-y-4">
          <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            關聯專案
          </h4>
          <div className="flex flex-wrap gap-2">
            {note.projects.length > 0 ? (
              note.projects.map((p) => (
                <div
                  key={p}
                  className="flex items-center gap-2 bg-warning/5 border border-warning/10 text-warning px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-warning/10 transition-colors"
                >
                  <FolderPlus size={12} />
                  {p}
                </div>
              ))
            ) : (
              <button className="text-[11px] text-primary hover:underline">+ 加入專案</button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            內容預覽
          </h4>
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
            {note.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
            ) : (
               <p className="text-muted-foreground italic">
                 {activeNote && activeNote.id === selectedNoteId ? '(無內容)' : '正在載入內容...'}
               </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
