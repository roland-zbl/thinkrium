# Change: Add Library Sync with File System

## Why

當使用者透過檔案總管或其他方式直接刪除 Markdown 檔案時，Library 資料庫不會同步更新，導致列表中出現孤立記錄（指向不存在檔案的筆記）。

目前現狀：
- ✅ Library 已有新增/刪除筆記按鈕（`FilterBar.tsx`）
- ✅ Library store 已有 `createNote` 和 `deleteNote` actions
- ✅ 無效的重置按鈕已移除
- ❌ 缺少檔案系統同步機制

## What Changes

1. 在 `note.service.ts` 新增 `syncWithFileSystem()` 方法
2. 新增 IPC handler `note:sync`
3. 在 Library 視圖載入時觸發同步
4. 同步後顯示 toast 通知（如果有記錄被清理）

## Impact

- Affected specs: library
- Affected code:
  - `electron/services/note.service.ts` - 新增 syncWithFileSystem 方法
  - `electron/ipc/note.ipc.ts` - 新增 note:sync handler
  - `electron/preload.ts` - 暴露 note.sync API
  - `src/renderer/src/modules/library/store/library.store.ts` - 新增 syncNotes action
  - `src/renderer/src/modules/library/LibraryView.tsx` - 在載入時觸發同步

## Technical Details

同步邏輯：
```typescript
async syncWithFileSystem(): Promise<{ removed: number }> {
  const rootDir = await this.getRootDir()
  if (!rootDir) return { removed: 0 }
  
  const db = getDatabase()
  const notes = db.prepare('SELECT id, file_path FROM notes').all()
  
  let removed = 0
  for (const note of notes) {
    const fullPath = join(rootDir, note.file_path)
    if (!existsSync(fullPath)) {
      db.prepare('DELETE FROM notes WHERE id = ?').run(note.id)
      removed++
    }
  }
  
  return { removed }
}
```
