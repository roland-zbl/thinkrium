# Change: Implement Note Management

## 概述

實作應用內筆記管理功能，包括筆記列表、詳情查看、編輯和導航整合。

## 依賴

- ✅ Note Storage 已實作（SaveNoteModal、資料庫 Schema）
- ✅ Settings 系統已實作

## 任務清單

### Task 1: 後端 IPC 擴展

**目標**: 擴展 Note IPC，支援列表查詢、單筆獲取、更新和刪除

**修改文件**: `electron/ipc/note.ipc.ts`

**新增 IPC 處理器**:

```typescript
// 獲取筆記列表
ipcMain.handle('note:list', async (_, filter?: NoteFilter) => {
    const db = getDatabase()
    let query = 'SELECT * FROM notes ORDER BY updated_at DESC'
    if (filter?.limit) {
        query += ` LIMIT ${filter.limit}`
    }
    const notes = db.prepare(query).all()
    return notes.map(note => ({
        ...note,
        tags: JSON.parse(note.tags || '[]'),
        aliases: JSON.parse(note.aliases || '[]')
    }))
})

// 獲取單個筆記（含文件內容）
ipcMain.handle('note:get', async (_, noteId: string) => {
    const db = getDatabase()
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId)
    if (note) {
        const rootDir = await noteService.getRootDir()
        const filePath = join(rootDir, note.file_path)
        const content = await fs.readFile(filePath, 'utf-8')
        return { 
            ...note, 
            content,
            tags: JSON.parse(note.tags || '[]'),
            aliases: JSON.parse(note.aliases || '[]')
        }
    }
    return null
})

// 更新筆記
ipcMain.handle('note:update', async (_, noteId: string, updates: NoteUpdate) => {
    return await noteService.updateNote(noteId, updates)
})

// 刪除筆記
ipcMain.handle('note:delete', async (_, noteId: string) => {
    return await noteService.deleteNote(noteId)
})
```

**修改文件**: `electron/preload.ts`

```typescript
note: {
    save: (input: any) => ipcRenderer.invoke('note:save', input),
    list: (filter?: any) => ipcRenderer.invoke('note:list', filter),
    get: (id: string) => ipcRenderer.invoke('note:get', id),
    update: (id: string, updates: any) => ipcRenderer.invoke('note:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('note:delete', id)
}
```

**驗證**:
```javascript
// 在 DevTools Console 執行
const notes = await window.api.note.list()
console.log(notes) // 應返回已保存的筆記列表
```

---

### Task 2: NoteService 擴展

**目標**: 在 NoteService 中添加更新和刪除方法

**修改文件**: `electron/services/note.service.ts`

**新增方法**:

```typescript
async updateNote(noteId: string, updates: NoteUpdate): Promise<Note> {
    const rootDir = await this.getRootDir()
    const db = getDatabase()
    
    // 1. 獲取現有筆記
    const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId)
    if (!existing) throw new Error('筆記不存在')
    
    // 2. 如果有內容更新，寫入文件
    if (updates.content) {
        const filePath = join(rootDir, existing.file_path)
        await writeFile(filePath, updates.content, 'utf-8')
    }
    
    // 3. 更新資料庫
    const now = new Date().toISOString()
    db.prepare(`
        UPDATE notes SET 
            title = COALESCE(@title, title),
            tags = COALESCE(@tags, tags),
            content_text = COALESCE(@content_text, content_text),
            updated_at = @updated_at
        WHERE id = @id
    `).run({
        id: noteId,
        title: updates.title || null,
        tags: updates.tags ? JSON.stringify(updates.tags) : null,
        content_text: updates.content ? this.stripMarkdown(updates.content) : null,
        updated_at: now
    })
    
    return db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId)
}

async deleteNote(noteId: string): Promise<void> {
    const rootDir = await this.getRootDir()
    const db = getDatabase()
    
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId)
    if (!note) return
    
    // 1. 刪除文件
    const filePath = join(rootDir, note.file_path)
    if (existsSync(filePath)) {
        await fs.unlink(filePath)
    }
    
    // 2. 刪除附件目錄
    const attachmentsPath = join(rootDir, 'attachments', noteId)
    if (existsSync(attachmentsPath)) {
        await fs.rm(attachmentsPath, { recursive: true })
    }
    
    // 3. 刪除資料庫記錄
    db.prepare('DELETE FROM notes WHERE id = ?').run(noteId)
}
```

---

### Task 3: 筆記列表組件

**目標**: 創建筆記列表頁面組件

**新增文件**:
- `src/renderer/src/modules/note/components/NoteList.tsx`
- `src/renderer/src/modules/note/components/NoteCard.tsx`

**NoteList.tsx 結構**:

```tsx
export const NoteList: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([])
    const [selectedNote, setSelectedNote] = useState<Note | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadNotes()
    }, [])

    const loadNotes = async () => {
        const list = await window.api.note.list()
        setNotes(list)
        setIsLoading(false)
    }

    return (
        <div className="note-list-container">
            <header className="note-list-header">
                <h2>📝 我的筆記</h2>
                <span>{notes.length} 篇</span>
            </header>
            
            <div className="note-list">
                {notes.map(note => (
                    <NoteCard 
                        key={note.id} 
                        note={note} 
                        onClick={() => setSelectedNote(note)}
                    />
                ))}
            </div>

            {selectedNote && (
                <NoteDetailView 
                    noteId={selectedNote.id}
                    onClose={() => setSelectedNote(null)}
                />
            )}
        </div>
    )
}
```

**NoteCard.tsx 結構**:

```tsx
interface NoteCardProps {
    note: Note
    onClick: () => void
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
    return (
        <div className="note-card" onClick={onClick}>
            <h3 className="note-title">{note.title}</h3>
            <div className="note-meta">
                <span className="note-date">
                    {new Date(note.updated_at).toLocaleDateString()}
                </span>
                {note.tags?.length > 0 && (
                    <div className="note-tags">
                        {note.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                        ))}
                    </div>
                )}
            </div>
            <p className="note-excerpt">
                {note.content_text?.substring(0, 100)}...
            </p>
        </div>
    )
}
```

---

### Task 4: 筆記詳情組件

**目標**: 創建筆記詳情和編輯頁面

**新增文件**:
- `src/renderer/src/modules/note/components/NoteDetailView.tsx`
- `src/renderer/src/modules/note/components/MarkdownRenderer.tsx`

**依賴安裝**:
```bash
npm install react-markdown remark-gfm
```

**NoteDetailView.tsx 結構**:

```tsx
interface Props {
    noteId: string
    onClose: () => void
}

export const NoteDetailView: React.FC<Props> = ({ noteId, onClose }) => {
    const [note, setNote] = useState<NoteWithContent | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState('')

    useEffect(() => {
        loadNote()
    }, [noteId])

    const loadNote = async () => {
        const data = await window.api.note.get(noteId)
        setNote(data)
        setEditContent(data?.content || '')
    }

    const handleSave = async () => {
        await window.api.note.update(noteId, { content: editContent })
        setIsEditing(false)
        loadNote()
    }

    return (
        <div className="note-detail-overlay">
            <article className="note-detail">
                <header>
                    <h1>{note?.title}</h1>
                    <div className="actions">
                        {isEditing ? (
                            <button onClick={handleSave}>💾 保存</button>
                        ) : (
                            <button onClick={() => setIsEditing(true)}>✏️ 編輯</button>
                        )}
                        <button onClick={onClose}>✕</button>
                    </div>
                </header>
                
                {isEditing ? (
                    <textarea 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                    />
                ) : (
                    <MarkdownRenderer 
                        content={note?.content || ''} 
                        rootDir={noteRootDir}
                    />
                )}
            </article>
        </div>
    )
}
```

**MarkdownRenderer.tsx 結構**:

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
    content: string
    rootDir: string
}

export const MarkdownRenderer: React.FC<Props> = ({ content, rootDir }) => {
    // 將相對路徑轉換為 file:// 絕對路徑
    const resolveImagePath = (src: string) => {
        if (src.startsWith('http') || src.startsWith('file://')) {
            return src
        }
        return `file://${rootDir}/${src}`.replace(/\\/g, '/')
    }

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                img: ({ src, alt }) => (
                    <img src={resolveImagePath(src || '')} alt={alt} />
                )
            }}
        >
            {content}
        </ReactMarkdown>
    )
}
```

---

### Task 5: 導航整合

**目標**: 在側邊欄和主界面整合筆記功能

**修改文件**: 
- `src/renderer/src/modules/feed/components/FeedFilters.tsx`
- `src/renderer/src/App.tsx`

**FeedFilters.tsx 變更**:

```tsx
interface Props {
    onAddClick: () => void
    currentView: 'feed' | 'notes'
    onViewChange: (view: 'feed' | 'notes') => void
}

// 在訂閱源列表後添加
<div className="nav-section">
    <h3 
        className={currentView === 'notes' ? 'active' : ''}
        onClick={() => onViewChange('notes')}
    >
        📝 我的筆記
    </h3>
</div>
```

**App.tsx 變更**:

```tsx
function App() {
    const [currentView, setCurrentView] = useState<'feed' | 'notes'>('feed')

    return (
        <div className="app-layout">
            <FeedFilters 
                onAddClick={...} 
                currentView={currentView}
                onViewChange={setCurrentView}
            />
            <main>
                {currentView === 'feed' && <FeedList />}
                {currentView === 'notes' && <NoteList />}
            </main>
        </div>
    )
}
```

---

## 實作順序

1. Task 1: 後端 IPC 擴展
2. Task 2: NoteService 擴展
3. Task 3: 筆記列表組件
4. Task 4: 筆記詳情組件（需先安裝 react-markdown）
5. Task 5: 導航整合

## 驗收標準

- [ ] 後端 IPC 正確返回筆記列表
- [ ] 可以獲取單個筆記的完整內容
- [ ] 筆記列表頁面正確渲染
- [ ] 點擊筆記卡片可以查看詳情
- [ ] Markdown 內容正確渲染，圖片正確顯示
- [ ] 可以編輯並保存筆記
- [ ] 側邊欄可以切換到筆記視圖
