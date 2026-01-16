# Note 模組規格

## Purpose

Note 模組提供筆記存儲、管理和檢索功能。採用 **Markdown First + Database Index** 架構：

- Markdown 文件是真實數據源（AI 工具可直接讀取）
- SQLite 資料庫是索引層（用於快速搜索和關聯）

---
## Requirements
### Requirement: Note Storage Architecture

系統 SHALL 採用雙重存儲架構，Markdown 文件為主、資料庫索引為輔。

#### Scenario: 保存新筆記

- **WHEN** 使用者從 RSS 文章創建筆記
- **THEN** 系統生成 Markdown 文件（含 frontmatter）
- **AND** 下載文章中的圖片到本地 attachments 目錄
- **AND** 將筆記元數據寫入資料庫索引

#### Scenario: 筆記文件結構

- **WHEN** 筆記被保存
- **THEN** 文件包含 frontmatter（id, title, date, tags, source_url）
- **AND** 文件包含原文內容（HTML 轉 Markdown）
- **AND** 文件包含個人筆記區域

#### Scenario: 圖片本地化

- **WHEN** 保存包含圖片的文章
- **THEN** 所有圖片被下載到 `attachments/<UUID>/` 目錄
- **AND** Markdown 中的圖片 URL 被替換為相對路徑

---

### Requirement: Database Index

系統 SHALL 維護筆記的資料庫索引，支援快速搜索和關聯查詢。

#### Scenario: 資料庫 Schema

- **WHEN** 應用程式啟動
- **THEN** 存在 `notes` 表（筆記索引）
- **AND** 存在 `note_links` 表（雙鏈關係）
- **AND** 存在 `notes_fts` 虛擬表（全文搜索）

#### Scenario: 索引同步

- **WHEN** Markdown 文件被外部編輯器修改
- **THEN** 資料庫索引自動更新以反映變更

#### Scenario: 衝突解決

- **WHEN** 資料庫索引與 Markdown 文件不一致
- **THEN** 以 Markdown 文件內容為準

---

### Requirement: Wiki Links (雙鏈)

系統 SHALL 支援 Obsidian 風格的 Wiki Links。

#### Scenario: 正向連結

- **WHEN** 筆記包含 `[[目標筆記]]` 語法
- **THEN** 解析為可點擊的內部連結
- **AND** 記錄 outgoing links 到資料庫

#### Scenario: 反向連結 (Backlinks)

- **WHEN** 使用者查看筆記 A
- **THEN** 顯示所有連結到筆記 A 的其他筆記
- **AND** 顯示連結所在的上下文片段

---

### Requirement: User Settings

系統 SHALL 允許使用者自定義筆記存儲路徑。

#### Scenario: 設定存儲路徑

- **WHEN** 使用者首次保存筆記
- **THEN** 提示選擇筆記存儲根目錄
- **AND** 將設定持久化到設定文件

#### Scenario: 讀取設定

- **WHEN** 應用程式啟動
- **THEN** 從設定文件讀取筆記根目錄
- **AND** 如果路徑不存在則提示使用者重新選擇

---

### Requirement: Save Note Modal

系統 SHALL 提供筆記保存模態視窗。

#### Scenario: 從 RSS 文章保存

- **WHEN** 使用者在文章詳情頁點擊「保存到筆記」
- **THEN** 開啟 SaveNoteModal
- **AND** 預填標題為文章標題
- **AND** 提供個人筆記輸入區域
- **AND** 提供標籤輸入區域

#### Scenario: 保存確認

- **WHEN** 使用者點擊「保存」按鈕
- **THEN** 生成 Markdown 文件並下載圖片
- **AND** 更新資料庫索引
- **AND** 顯示成功提示並關閉 Modal

---

### Requirement: Note List View

系統 SHALL 提供筆記列表頁面，顯示所有已保存的筆記。

#### Scenario: 查看筆記列表

- **WHEN** 使用者點擊側邊欄「我的筆記」
- **THEN** 主內容區顯示筆記列表
- **AND** 每個筆記卡片顯示：標題、日期、標籤、摘要

#### Scenario: 搜索筆記

- **WHEN** 使用者在搜索框輸入關鍵字
- **THEN** 使用全文搜索查詢匹配的筆記
- **AND** 高亮顯示匹配的關鍵字

#### Scenario: 篩選筆記

- **WHEN** 使用者選擇標籤篩選
- **THEN** 只顯示包含該標籤的筆記

---

### Requirement: Note Detail View

系統 SHALL 提供筆記詳情頁面，渲染 Markdown 內容。

#### Scenario: 查看筆記詳情

- **WHEN** 使用者點擊筆記卡片
- **THEN** 開啟筆記詳情頁
- **AND** 渲染 Markdown 內容（包含標題、原文、個人筆記）
- **AND** 正確顯示本地圖片

#### Scenario: 圖片路徑解析

- **WHEN** Markdown 內容包含相對路徑圖片
- **THEN** 系統將相對路徑轉換為可訪問的絕對路徑
- **AND** 圖片正確渲染

#### Scenario: 顯示來源連結

- **WHEN** 筆記有 source_url
- **THEN** 在詳情頁顯示「查看原文」連結

---

### Requirement: Note Editor

系統 SHALL 提供筆記編輯功能。

#### Scenario: 進入編輯模式

- **WHEN** 使用者在詳情頁點擊「編輯」按鈕
- **THEN** 切換到編輯模式
- **AND** 顯示可編輯的文本區域

#### Scenario: 編輯標題

- **WHEN** 使用者修改標題
- **THEN** 標題欄變為可編輯輸入框

#### Scenario: 編輯內容

- **WHEN** 使用者修改筆記內容
- **THEN** 顯示 Markdown 編輯器
- **AND** 可選：提供實時預覽

#### Scenario: 保存變更

- **WHEN** 使用者點擊「保存」按鈕
- **THEN** 更新 .md 文件內容
- **AND** 更新資料庫索引
- **AND** 顯示保存成功提示

---

### Requirement: Navigation Integration

系統 SHALL 在側邊欄提供筆記模組的導航入口。

#### Scenario: 側邊欄導航

- **WHEN** 應用程式啟動
- **THEN** 側邊欄顯示「我的筆記」入口
- **AND** 點擊後切換到筆記列表視圖

#### Scenario: 視圖切換

- **WHEN** 使用者在「訂閱源」和「我的筆記」之間切換
- **THEN** 主內容區更新為對應的視圖
- **AND** 保持側邊欄當前選中狀態

---

### Requirement: Note CRUD Operations

系統 SHALL 支援筆記的完整 CRUD 操作。

#### Scenario: 列表查詢

- **WHEN** 用戶請求筆記列表
- **THEN** 系統返回所有筆記的摘要資訊
- **AND** 按更新時間降序排列

#### Scenario: 單筆獲取

- **WHEN** 用戶請求特定筆記詳情
- **THEN** 系統返回筆記元數據和完整 Markdown 內容

#### Scenario: 更新筆記

- **WHEN** 用戶修改並保存筆記
- **THEN** 系統更新本地 Markdown 文件
- **AND** 更新資料庫索引記錄

#### Scenario: 刪除筆記

- **WHEN** 用戶刪除筆記
- **THEN** 系統移除 Markdown 文件
- **AND** 刪除關聯的附件目錄
- **AND** 從資料庫移除記錄

### Requirement: Note Markdown Rendering

系統 SHALL 能正確渲染筆記的 Markdown 內容。

#### Scenario: GFM 支援

- **WHEN** 筆記包含 GFM 語法（表格、任務列表、刪除線）
- **THEN** 正確渲染對應的 HTML 元素

#### Scenario: 本地圖片支援

- **WHEN** 筆記引用本地附件圖片
- **THEN** 系統將相對路徑轉換為 `file://` 絕對路徑
- **AND** 圖片正確顯示

## 技術規範

### 資料庫 Schema

```sql
-- 筆記索引表
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  source_url TEXT,
  source_type TEXT DEFAULT 'manual',
  source_item_id TEXT,
  content_text TEXT,
  tags TEXT,
  aliases TEXT,
  outgoing_links TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  file_modified_at DATETIME,
  FOREIGN KEY (source_item_id) REFERENCES feed_items(id)
);

-- 雙鏈關係表
CREATE TABLE IF NOT EXISTS note_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_note_id TEXT NOT NULL,
  to_note_id TEXT NOT NULL,
  link_text TEXT,
  context TEXT,
  FOREIGN KEY (from_note_id) REFERENCES notes(id),
  FOREIGN KEY (to_note_id) REFERENCES notes(id)
);

-- 全文搜索索引
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  title, content_text, tags,
  content='notes',
  content_rowid='rowid'
);

-- 設定表
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

### IPC 接口

```typescript
// 保存筆記
window.api.note.save(input: SaveNoteInput): Promise<Note>

// 獲取筆記列表
window.api.note.list(filter?: NoteFilter): Promise<Note[]>

// 獲取單個筆記（含文件內容）
window.api.note.get(id: string): Promise<NoteWithContent | null>

// 更新筆記
window.api.note.update(id: string, updates: NoteUpdate): Promise<Note>

// 刪除筆記
window.api.note.delete(id: string): Promise<void>

// 搜索筆記
window.api.note.search(query: string): Promise<Note[]>

// 獲取 Backlinks
window.api.note.getBacklinks(noteId: string): Promise<NoteLink[]>

// 設定
window.api.settings.get(key: string): Promise<string | null>
window.api.settings.set(key: string, value: string): Promise<void>
window.api.settings.selectDirectory(): Promise<string | null>
```

### 組件結構

```
src/renderer/src/modules/
├── feed/
│   └── components/
│       └── FeedDetailView.tsx  # 連接 SaveNoteModal
└── note/
    ├── components/
    │   ├── SaveNoteModal.tsx   # 保存筆記對話框
    │   ├── NoteList.tsx        # 筆記列表頁
    │   ├── NoteCard.tsx        # 筆記卡片組件
    │   ├── NoteDetailView.tsx  # 筆記詳情頁
    │   ├── NoteEditor.tsx      # 筆記編輯器
    │   └── MarkdownRenderer.tsx # Markdown 渲染器
    ├── services/
    │   └── note.service.ts     # 前端服務層
    ├── store/
    │   └── note.store.ts       # Zustand store
    └── types.ts                # 類型定義
```

### 依賴

```json
{
  "react-markdown": "^9.x",
  "remark-gfm": "^4.x"
}
```
