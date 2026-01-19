# Tasks: Add OPML Import/Export

## 1. OPML 解析服務

### 1.1 新增 OPML Service
- [ ] 1.1.1 安裝依賴：`npm install fast-xml-parser`
- [ ] 1.1.2 新增 `electron/services/opml.service.ts`
- [ ] 1.1.3 實現 `parseOpml(content: string): OpmlFeed[]` 函數
  - 解析 `<outline>` 節點
  - 提取 `type="rss"`, `xmlUrl`, `title`, `htmlUrl`
  - 保留層級結構作為分類
- [ ] 1.1.4 實現 `generateOpml(feeds: Feed[]): string` 函數
  - 按分類分組輸出 OPML 結構

### 1.2 定義資料結構
- [ ] 1.2.1 在 `electron/types/opml.ts` 定義 `OpmlFeed` 和 `OpmlExport` 介面

---

## 2. IPC 橋接

### 2.1 新增匯入 IPC
- [ ] 2.1.1 在 `feed.ipc.ts` 新增 `feed:import-opml` handler
  - 接收檔案路徑
  - 讀取並解析 OPML
  - 批次呼叫 `feedService.addFeed()` (跳過重複)
  - 回傳 `{ added: number, skipped: number, errors: string[] }`

### 2.2 新增匯出 IPC
- [ ] 2.2.1 在 `feed.ipc.ts` 新增 `feed:export-opml` handler
  - 呼叫 `feedService.getAllFeeds()`
  - 生成 OPML 字串
  - 使用 `dialog.showSaveDialog()` 讓用戶選擇位置
  - 寫入檔案

### 2.3 Preload 暴露
- [ ] 2.3.1 在 `preload/index.ts` 暴露 `feed.importOpml(filePath)` 和 `feed.exportOpml()`
- [ ] 2.3.2 新增 `dialog.openFile({ filters: [{ name: 'OPML', extensions: ['opml', 'xml'] }] })`

---

## 3. 前端 UI

### 3.1 匯入對話框
- [ ] 3.1.1 新增 `ImportOpmlDialog.tsx` 元件
  - 顯示選擇檔案按鈕
  - 顯示解析結果預覽（待匯入的訂閱數量）
  - 確認匯入按鈕
  - 顯示結果摘要（成功/跳過/失敗數量）

### 3.2 匯出功能
- [ ] 3.2.1 在 `SubscriptionSidebar.tsx` 新增 OPML 匯入/匯出按鈕（或選單）
- [ ] 3.2.2 匯出點擊後呼叫 `window.api.feed.exportOpml()`
- [ ] 3.2.3 成功後顯示 Toast 訊息

### 3.3 Store 整合
- [ ] 3.3.1 在 `feed.store.ts` 新增 `importOpml(filePath: string)` action
- [ ] 3.3.2 匯入完成後自動呼叫 `fetchSubscriptions()` 刷新列表

---

## 4. 驗證與測試

- [ ] 4.1 手動測試：匯入標準 OPML 檔案（從 Feedly 或 Inoreader 匯出）
- [ ] 4.2 手動測試：匯入含多層 folder 的 OPML
- [ ] 4.3 手動測試：匯入重複訂閱，確認跳過邏輯
- [ ] 4.4 手動測試：匯出後重新匯入，確認往返一致性
- [ ] 4.5 單元測試：為 `parseOpml` 和 `generateOpml` 撰寫測試
