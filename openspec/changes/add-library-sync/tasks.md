## 1. Backend Implementation

- [ ] 1.1 在 `electron/services/note.service.ts` 新增 `syncWithFileSystem()` 方法:
  ```typescript
  async syncWithFileSystem(): Promise<{ removed: number }> {
    const rootDir = await this.getRootDir()
    if (!rootDir) return { removed: 0 }
    
    const db = getDatabase()
    const notes = db.prepare('SELECT id, file_path FROM notes').all() as { id: string; file_path: string }[]
    
    let removed = 0
    for (const note of notes) {
      const fullPath = join(rootDir, note.file_path)
      if (!existsSync(fullPath)) {
        db.prepare('DELETE FROM notes WHERE id = ?').run(note.id)
        removed++
        console.log(`[NoteService] Removed orphan note: ${note.id}`)
      }
    }
    
    return { removed }
  }
  ```

## 2. IPC Integration

- [ ] 2.1 在 `electron/ipc/note.ipc.ts` 新增 handler:
  ```typescript
  ipcMain.handle('note:sync', () =>
    handleIPC(async () => {
      return await noteService.syncWithFileSystem()
    })
  )
  ```
- [ ] 2.2 在 `electron/preload.ts` 暴露 API:
  ```typescript
  note: {
    // ...existing methods...
    sync: () => ipcRenderer.invoke('note:sync')
  }
  ```

## 3. Frontend Integration

- [ ] 3.1 在 `library.store.ts` 新增 `syncNotes` action:
  ```typescript
  syncNotes: async () => {
    try {
      const result = await invokeIPC(window.api.note.sync(), { showErrorToast: false })
      if (result.removed > 0) {
        useToastStore.getState().addToast({
          type: 'info',
          title: '資料庫已同步',
          description: `已清理 ${result.removed} 筆孤立記錄`
        })
        await get().fetchNotes()
      }
    } catch (error) {
      console.error('Failed to sync notes:', error)
    }
  }
  ```
- [ ] 3.2 在 `LibraryView.tsx` 的 useEffect 中呼叫 syncNotes:
  ```typescript
  React.useEffect(() => {
    if (currentView === 'library') {
      syncNotes().then(() => fetchNotes())
    }
  }, [fetchNotes, syncNotes, currentView])
  ```

## 4. Testing

- [ ] 4.1 新增 `electron/__tests__/note-sync.test.ts` 測試同步邏輯
- [ ] 4.2 手動測試：
  1. 在 Library 建立一個筆記
  2. 用檔案總管刪除對應的 .md 檔案
  3. 切換到其他模組再切回 Library
  4. 確認該筆記從列表消失且顯示 toast 通知
