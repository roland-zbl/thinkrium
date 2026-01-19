# Tasks: Add Full-Text Feed Search

## 1. 資料庫 FTS5 索引

### 1.1 建立 FTS 虛擬表
- [ ] 1.1.1 在 `electron/database.ts` 新增 FTS5 虛擬表：
  ```sql
  CREATE VIRTUAL TABLE IF NOT EXISTS feed_items_fts USING fts5(
    title,
    content,
    author,
    content='feed_items',
    content_rowid='rowid'
  )
  ```
- [ ] 1.1.2 建立觸發器自動同步 FTS 索引（INSERT/UPDATE/DELETE）
- [ ] 1.1.3 初次啟動時重建索引（處理既有資料）

---

## 2. 後端搜尋服務

### 2.1 Search Method
- [ ] 2.1.1 在 `feed.service.ts` 新增 `searchItems(query: string, options?: SearchOptions)`
- [ ] 2.1.2 SearchOptions 包含：`feedId?`, `folderId?`, `limit`, `offset`
- [ ] 2.1.3 使用 FTS5 MATCH 語法：`SELECT * FROM feed_items_fts WHERE feed_items_fts MATCH ?`
- [ ] 2.1.4 回傳結果包含 snippet（高亮片段）

### 2.2 IPC 橋接
- [ ] 2.2.1 在 `feed.ipc.ts` 新增 `feed:search` handler
- [ ] 2.2.2 在 `preload/index.ts` 暴露 `window.api.feed.search(query, options)`

---

## 3. 前端 Store

### 3.1 Search State
- [ ] 3.1.1 在 `feed.store.ts` 新增狀態：
  - `searchQuery: string`
  - `searchResults: FeedItem[]`
  - `isSearching: boolean`
- [ ] 3.1.2 新增 `search(query: string)` action（含 debounce）
- [ ] 3.1.3 新增 `clearSearch()` action

---

## 4. 前端 UI

### 4.1 搜尋列
- [ ] 4.1.1 新增 `SearchBar.tsx` 元件
  - Search icon + 輸入框
  - Clear button (X)
  - Loading spinner
- [ ] 4.1.2 整合到 `FilterTabs.tsx` 或 Feed 頁面頂部
- [ ] 4.1.3 快捷鍵 `/` 或 `Cmd+K` 聚焦搜尋框

### 4.2 搜尋結果顯示
- [ ] 4.2.1 搜尋模式下，`FeedItemList` 顯示 `searchResults` 而非 `items`
- [ ] 4.2.2 搜尋結果 snippet 高亮顯示關鍵字
- [ ] 4.2.3 空結果時顯示「無匹配結果」提示

### 4.3 搜尋範圍選擇
- [ ] 4.3.1 下拉選單：全部 / 當前訂閱 / 當前資料夾
- [ ] 4.3.2 預設為「全部」

---

## 5. 驗證與測試

- [ ] 5.1 手動測試：搜尋標題關鍵字
- [ ] 5.2 手動測試：搜尋內文關鍵字
- [ ] 5.3 手動測試：搜尋中文內容
- [ ] 5.4 手動測試：搜尋無結果的情況
- [ ] 5.5 性能測試：1000+ 條目下搜尋響應時間 < 500ms
