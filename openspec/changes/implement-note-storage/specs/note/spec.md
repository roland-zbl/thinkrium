# Change: Implement Note Storage

## 概述

實作筆記存儲系統的基礎架構，包括資料庫 Schema、設定系統、和 SaveNoteModal UI。

## 依賴

- ✅ Feed 模組已完成
- ✅ 資料庫系統已就緒

## 任務清單

### Task 1: 資料庫 Migration

**目標**: 創建 notes 相關的資料表

**文件**: `electron/database.ts`

**變更**:
1. 在 `runMigrations()` 中添加 `002_notes_schema` migration
2. Schema 內容見 `openspec/specs/note/spec.md` 的「資料庫 Schema」章節
3. 包含 `notes`, `note_links`, `notes_fts`, `settings` 四個表

**驗證**:
```javascript
// 在 DevTools Console 執行
await window.api.db.exec("SELECT name FROM sqlite_master WHERE type='table'")
// 應包含 notes, note_links, settings
```

---

### Task 2: 設定系統

**目標**: 實作用戶設定的讀寫和目錄選擇

**新增文件**:
- `electron/ipc/settings.ipc.ts` - IPC 處理器
- `src/preload/index.ts` - 暴露 settings API

**IPC 接口**:
```typescript
ipcMain.handle('settings:get', (_, key: string) => { ... })
ipcMain.handle('settings:set', (_, key: string, value: string) => { ... })
ipcMain.handle('settings:selectDirectory', () => {
  // 使用 Electron dialog.showOpenDialog
  // 返回選擇的目錄路徑
})
```

**驗證**:
```javascript
// 設定存儲路徑
const dir = await window.api.settings.selectDirectory()
await window.api.settings.set('notes.rootDir', dir)
// 讀取設定
const savedDir = await window.api.settings.get('notes.rootDir')
console.log(savedDir === dir) // true
```

---

### Task 3: Note Service 後端

**目標**: 實作筆記保存的核心邏輯

**新增文件**:
- `electron/services/note.service.ts`
- `electron/ipc/note.ipc.ts`

**核心功能**:

1. **generateMarkdown(input)**: 生成帶 frontmatter 的 Markdown
2. **downloadImages(html, notePath)**: 下載圖片並替換 URL
3. **htmlToMarkdown(html)**: HTML 轉 Markdown（使用 turndown 庫）
4. **saveNote(input)**: 整合流程

**依賴安裝**:
```bash
npm install turndown @types/turndown
```

**驗證**:
```javascript
const note = await window.api.note.save({
  title: '測試筆記',
  content: '<p>Hello <strong>World</strong></p>',
  sourceUrl: 'https://example.com'
})
// 應在設定的目錄中生成 .md 文件
```

---

### Task 4: SaveNoteModal UI

**目標**: 實作保存筆記的對話框

**新增文件**:
- `src/renderer/src/modules/note/components/SaveNoteModal.tsx`
- `src/renderer/src/modules/note/types.ts`

**UI 結構**:
```
┌─────────────────────────────────────────┐
│  保存到筆記                        [X]  │
├─────────────────────────────────────────┤
│  標題: [________________________]       │
│                                         │
│  原文內容                               │
│  ┌─────────────────────────────────┐    │
│  │ (Markdown 預覽)                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  個人筆記                               │
│  ┌─────────────────────────────────┐    │
│  │ (文本輸入區)                    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  標籤: [_______________] (預留)         │
│                                         │
│  [取消]              [💾 保存筆記]      │
└─────────────────────────────────────────┘
```

**狀態管理**:
- title: string (預填文章標題)
- content: string (HTML 轉 Markdown 後的內容)
- personalNote: string (個人筆記)
- tags: string[] (標籤，暫時手動輸入)
- isLoading: boolean
- error: string | null

---

### Task 5: 連接 FeedDetailView

**目標**: 將「保存到筆記」按鈕連接到 SaveNoteModal

**修改文件**: `src/renderer/src/modules/feed/components/FeedDetailView.tsx`

**變更**:
1. 導入 SaveNoteModal
2. 添加 `showSaveModal` state
3. 將按鈕 onClick 設為 `setShowSaveModal(true)`
4. 渲染 SaveNoteModal，傳入當前文章數據

**驗證**:
1. 打開文章詳情頁
2. 點擊「保存到筆記」按鈕
3. Modal 應正確顯示並預填文章標題
4. 保存後應生成 .md 文件

---

## 實作順序

1. Task 1: 資料庫 Migration（獨立）
2. Task 2: 設定系統（依賴 Task 1）
3. Task 3: Note Service（依賴 Task 1, 2）
4. Task 4: SaveNoteModal（依賴 Task 3）
5. Task 5: 連接 FeedDetailView（依賴 Task 4）

## 驗收標準

- [ ] 資料庫中存在 notes, note_links, settings 表
- [ ] 可以選擇並保存筆記存儲目錄
- [ ] 從 RSS 文章點擊「保存到筆記」能打開 Modal
- [ ] 保存後生成正確格式的 .md 文件
- [ ] 圖片被下載到 attachments 目錄
- [ ] 資料庫索引正確創建
