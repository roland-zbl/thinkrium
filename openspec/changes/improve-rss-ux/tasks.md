# Tasks: Improve RSS Reader UX

## 1. 未讀過濾行為修正 (Unread Filter Behavior)

### 1.1 修改過濾邏輯 - 延遲移除已讀項目
- [ ] 1.1.1 在 `feed.store.ts` 新增 `recentlyReadIds: Set<string>` 狀態，暫存當前工作階段中標記為已讀的 ID
- [ ] 1.1.2 修改 `markAsRead` 函數：將 ID 加入 `recentlyReadIds` 而非立即從列表移除
- [ ] 1.1.3 在 `setFilter` 和 `setActiveSubscription` 時清空 `recentlyReadIds`（切換時真正移除）
- [ ] 1.1.4 修改 `FeedItemList.tsx` 的過濾邏輯：在「未讀」模式下，額外保留 `recentlyReadIds` 中的項目

### 1.2 已讀項目視覺區分（灰顯樣式）
- [ ] 1.2.1 修改 `FeedItemCard.tsx`：當 `status === 'read'` 且 `filter === 'unread'` 時，套用 `opacity-50` 或 `bg-muted` 灰顯樣式
- [ ] 1.2.2 確保灰顯項目仍可點擊、可選取

### 1.3 新增「自動隱藏已讀」開關（Optional Enhancement）
- [ ] 1.3.1 在 `feed.store.ts` 新增 `autoHideRead: boolean` 狀態
- [ ] 1.3.2 在 `FilterTabs.tsx` 新增開關按鈕（齒輪圖示或設定按鈕）
- [ ] 1.3.3 當 `autoHideRead === true` 時，恢復原有立即移除行為

---

## 2. 文章預覽 Typography 優化

### 2.1 優化中文字體堆疊
- [ ] 2.1.1 修改 `tailwind.config.js`：更新 `fontFamily.sans` 為 `['Inter', 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'system-ui', 'sans-serif']`
- [ ] 2.1.2 確認 Google Fonts 引入 Inter 字體（在 `index.html` 或 CSS 中）

### 2.2 優化 FeedPreview 文章渲染樣式
- [ ] 2.2.1 在 `FeedPreview.tsx` 調整 `prose` 樣式：
  - 內文字號：`prose-lg` (18px)
  - 行高：`leading-relaxed` 或自訂 `leading-[1.8]`
  - 最大寬度：`max-w-prose` (65ch)
- [ ] 2.2.2 優化段落間距：`prose-p:my-6`
- [ ] 2.2.3 優化標題樣式：確保 H1-H3 層級清晰
- [ ] 2.2.4 優化程式碼區塊：`prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg`
- [ ] 2.2.5 優化圖片樣式：確保 `max-w-full` 且置中

### 2.3 優化色彩對比度
- [ ] 2.3.1 確認內文顏色對比度 ≥ 4.5:1 (WCAG AA)
- [ ] 2.3.2 調整連結顏色為 `text-primary` 並確保 hover 狀態明顯

---

## 3. Quick Note 功能完善

### 3.1 實現保存邏輯
- [ ] 3.1.1 在 `feed.store.ts` 新增 `saveQuickNote(itemId: string, note: string): Promise<void>` 函數
- [ ] 3.1.2 設計資料結構：將 Quick Note 保存至 `feed_items` 表的新欄位 `quick_note`，或獨立 `quick_notes` 表
- [ ] 3.1.3 新增 IPC 處理：`feed:save-quick-note` -> `feedService.saveQuickNote()`

### 3.2 整合 FeedPreview UI
- [ ] 3.2.1 在 `FeedPreview.tsx` 的 Send 按鈕綁定 `saveQuickNote` 函數
- [ ] 3.2.2 保存後顯示 Toast 成功訊息
- [ ] 3.2.3 載入項目時回填已儲存的 Quick Note

### 3.3 資料庫擴展
- [ ] 3.3.1 修改 `electron/database.ts` 新增 `quick_note TEXT` 欄位到 `feed_items` 表（或建立新表）
- [ ] 3.3.2 在 `feed.service.ts` 新增 `saveQuickNote()` 和 `getQuickNote()` 方法
- [ ] 3.3.3 在 `feed.ipc.ts` 註冊對應的 IPC handler

---

## 4. 驗證與測試

- [ ] 4.1 手動測試：在「未讀」模式下點擊文章，確認不會立即消失
- [ ] 4.2 手動測試：切換到「全部」再切回「未讀」，確認已讀項目已移除
- [ ] 4.3 手動測試：閱讀長文章，確認 Typography 舒適
- [ ] 4.4 手動測試：輸入 Quick Note 並保存，確認資料持久化
- [ ] 4.5 單元測試：為 `markAsRead` 和 `saveQuickNote` 新增測試案例
