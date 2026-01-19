# Change: Add Full-Text Feed Search

## Why

隨著訂閱內容累積，用戶需要快速搜尋過去讀過或保存的文章。目前沒有任何搜尋功能，用戶只能手動瀏覽列表。

Feedly、Inoreader、Readwise Reader 都提供全文搜尋功能，這是重度用戶的必備功能。

## What Changes

### 1. 搜尋索引
- 使用 SQLite FTS5 擴展建立全文索引
- 索引欄位：`title`, `content`, `author`

### 2. 搜尋 UI
- 在 Filter Bar 區域新增搜尋輸入框
- 支援即時搜尋（debounce 300ms）
- 搜尋結果高亮顯示關鍵字

### 3. 搜尋範圍
- 預設搜尋全部訂閱
- 可限定搜尋當前選取的訂閱/資料夾

## Impact

- **Affected Specs**: `feed`
- **Affected Code**:
    - `electron/database.ts` (FTS5 schema)
    - `electron/services/feed.service.ts` (Search method)
    - `src/renderer/src/modules/feed/store/feed.store.ts` (Search state)
    - `src/renderer/src/modules/feed/components/SearchBar.tsx` (New)
    - `src/renderer/src/modules/feed/components/FilterTabs.tsx` (Integrate search)
