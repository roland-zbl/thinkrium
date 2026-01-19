# Tasks: Add Article Highlights & Annotations

## 1. 資料庫結構

### 1.1 新增 Highlights 表
- [ ] 1.1.1 在 `electron/database.ts` 新增 `highlights` 表：
  ```sql
  CREATE TABLE IF NOT EXISTS highlights (
    id TEXT PRIMARY KEY,
    feed_item_id TEXT NOT NULL,
    text TEXT NOT NULL,
    note TEXT,
    color TEXT DEFAULT 'yellow',
    start_offset INTEGER NOT NULL,
    end_offset INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feed_item_id) REFERENCES feed_items(id) ON DELETE CASCADE
  )
  ```

---

## 2. 後端服務

### 2.1 Highlight Service
- [ ] 2.1.1 新增 `electron/services/highlight.service.ts`
- [ ] 2.1.2 實現 `createHighlight(data)`: 建立 Highlight
- [ ] 2.1.3 實現 `updateHighlight(id, note)`: 更新筆記
- [ ] 2.1.4 實現 `deleteHighlight(id)`: 刪除 Highlight
- [ ] 2.1.5 實現 `getHighlightsByItem(feedItemId)`: 取得某文章的所有 Highlight
- [ ] 2.1.6 實現 `getAllHighlights()`: 取得所有 Highlight（供 Library 使用）

### 2.2 IPC 橋接
- [ ] 2.2.1 新增 `highlight.ipc.ts`
- [ ] 2.1.2 暴露所有 CRUD 操作
- [ ] 2.1.3 在 `preload/index.ts` 暴露 `window.api.highlight.*`

---

## 3. 前端 Store

### 3.1 Highlight State
- [ ] 3.1.1 在 `feed.store.ts` 新增 `highlights: Map<string, Highlight[]>` (keyed by itemId)
- [ ] 3.1.2 新增 `fetchHighlights(itemId)` action
- [ ] 3.1.3 新增 `createHighlight()`, `updateHighlight()`, `deleteHighlight()` actions

---

## 4. 前端 UI

### 4.1 文字選取處理
- [ ] 4.1.1 在 `FeedPreview.tsx` 監聽 `mouseup` 事件
- [ ] 4.1.2 當有選取文字時，計算選取範圍的 offset
- [ ] 4.1.3 顯示浮動 Highlight 工具列

### 4.2 Highlight 工具列
- [ ] 4.2.1 新增 `HighlightToolbar.tsx` 元件
  - 顏色選擇按鈕（黃、綠、藍、粉）
  - 添加筆記按鈕
  - 取消按鈕
- [ ] 4.2.2 工具列定位於選取文字上方

### 4.3 Highlight 渲染
- [ ] 4.3.1 新增 `HighlightedText.tsx` 或修改 `FeedPreview` 的 HTML 渲染邏輯
- [ ] 4.3.2 將 Highlight 區段用 `<mark>` 標籤包裹
- [ ] 4.3.3 不同顏色對應不同 CSS class

### 4.4 Annotation 筆記
- [ ] 4.4.1 點擊已 Highlight 區段顯示筆記 tooltip
- [ ] 4.4.2 支援編輯和刪除筆記

### 4.5 快捷鍵
- [ ] 4.5.1 選取文字後按 `H` 快速標記為黃色 Highlight
- [ ] 4.5.2 `N` 標記並開啟筆記輸入

---

## 5. 驗證與測試

- [ ] 5.1 手動測試：選取文字並標記 Highlight
- [ ] 5.2 手動測試：不同顏色 Highlight
- [ ] 5.3 手動測試：為 Highlight 添加筆記
- [ ] 5.4 手動測試：刪除 Highlight
- [ ] 5.5 手動測試：重新開啟文章時 Highlight 仍顯示
- [ ] 5.6 手動測試：重疊選取區域處理
