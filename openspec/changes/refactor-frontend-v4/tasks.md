# Implementation Tasks

> 每個 Phase 有明確的確認點和審查標準

---

## Phase 0: 環境準備

### 確認點

- [x] 0.1 新依賴安裝完成
- [x] 0.2 舊目錄已備份/刪除
- [x] 0.3 新目錄結構已建立
- [x] 0.4 Mock 資料檔案已創建

### 審查標準

| 項目      | 標準                      | 驗證方式 |
| --------- | ------------------------- | -------- |
| 編譯成功  | `npm run dev` 無錯誤      | CLI 輸出 |
| 目錄結構  | 符合 design.md 規範       | 目視檢查 |
| Mock 資料 | 包含 feeds/projects/notes | 檔案存在 |

---

## Phase 1: Layout 重建

### 確認點

- [x] 1.1 `AppShell.tsx` 重寫（display:none 策略）
- [x] 1.2 `Sidebar.tsx` 重寫（4 主入口 + 展開專案列表）
- [x] 1.3 `MainContent.tsx` 新增
- [x] 1.4 `AuxPanel.tsx` 新增
- [x] 1.5 `TabBar.tsx` 精簡（只放 Editor/ProjectPage）
- [x] 1.6 `app.store.ts` 全域狀態建立

### 審查標準

| 項目         | 標準                                       | 驗證方式       |
| ------------ | ------------------------------------------ | -------------- |
| Sidebar 導航 | 顯示 Dashboard/Feed/Library/Project 4 入口 | 視覺確認       |
| Sidebar 展開 | Hover 時展開至 200px，顯示專案列表         | 交互測試       |
| 視圖切換     | 點擊導航項切換視圖，無報錯                 | Console 無錯誤 |
| 狀態保持     | 切換視圖後返回，滾動位置保持               | 滾動-切換-返回 |
| Tab Bar      | 初始隱藏（無 Tab 時）                      | 視覺確認       |

---

## Phase 2: Dashboard 模塊

### 確認點

- [x] 2.1 `DashboardView.tsx` 2x2 Grid 佈局
- [x] 2.2 `TodayFocusWidget.tsx`（日記+最緊急專案）
- [x] 2.3 `ActiveProjectsWidget.tsx`
- [x] 2.4 `NewItemsWidget.tsx`
- [x] 2.5 `RecentCompletedWidget.tsx`
- [x] 2.6 Mock 資料連接

### 審查標準

| 項目        | 標準                      | 驗證方式       |
| ----------- | ------------------------- | -------------- |
| Grid 佈局   | 4 個 Widget 正確排列      | 視覺確認       |
| Today Focus | 顯示日記入口 + 最緊急專案 | 資料正確       |
| 空狀態      | 無資料時顯示提示文案      | 移除 Mock 測試 |
| 點擊行為    | 點擊日記開 Editor Tab     | 交互測試       |

---

## Phase 3: Feed 模塊

### 確認點

- [x] 3.1 `FeedView.tsx` 三欄 ResizablePanel
- [x] 3.2 `SubscriptionSidebar.tsx`
- [x] 3.3 `FeedItemList.tsx`（虛擬滾動）
- [x] 3.4 `FeedItemCard.tsx`（可拖曳）
- [x] 3.5 `FeedPreview.tsx`（速記區）
- [x] 3.6 `FilterTabs.tsx`
- [x] 3.7 `AddSubscriptionDialog.tsx`
- [x] 3.8 `feed.store.ts`
- [x] 3.9 鍵盤快捷鍵實作（S/P/E/J/K/Space）
- [x] 3.10 拖曳到專案功能

### 審查標準

| 項目     | 標準                     | 驗證方式 |
| -------- | ------------------------ | -------- |
| 三欄佈局 | 200px / flex / 400px     | 視覺確認 |
| 欄寬調整 | 拖曳 handle 可調整       | 交互測試 |
| 虛擬滾動 | 1000 條項目不卡頓        | 效能測試 |
| 預覽展開 | 單擊項目展開預覽         | 交互測試 |
| 快捷鍵 S | 選中項目後按 S 保存      | 交互測試 |
| 拖曳     | 拖到專案圖標彈出 Popover | 交互測試 |
| 新增訂閱 | Dialog 欄位正確          | 視覺確認 |

---

## Phase 4: Library 模塊

### 確認點

- [x] 4.1 `LibraryView.tsx` 兩欄佈局
- [x] 4.2 `FilterBar.tsx`（Type/Tags/Date/關聯專案）
- [ ] 4.3 `ViewToggle.tsx`（列表視圖優先）
- [x] 4.4 `NoteTable.tsx`（虛擬滾動）
- [x] 4.5 `NotePreview.tsx`
- [x] 4.6 `library.store.ts`

### 審查標準

| 項目      | 標準                | 驗證方式 |
| --------- | ------------------- | -------- |
| 過濾器    | 4 個下拉可用        | 交互測試 |
| Type 過濾 | 選 note 只顯示 note | 資料正確 |
| 預覽      | 單擊顯示預覽        | 交互測試 |
| 雙擊編輯  | 雙擊開 Editor Tab   | 交互測試 |

---

## Phase 5: Project 模塊

### 確認點

- [x] 5.1 `ProjectListView.tsx`（狀態分組）
- [x] 5.2 `ProjectCard.tsx`
- [x] 5.3 `StatusGroup.tsx`（可展開/收合）
- [x] 5.4 `ProjectPageView.tsx`
- [ ] 5.5 `DeliverableSection.tsx`
- [ ] 5.6 `MaterialsTable.tsx`
- [ ] 5.7 `ProjectNotes.tsx`
- [ ] 5.8 `StatusDropdown.tsx`
- [x] 5.9 `project.store.ts`

### 審查標準

| 項目     | 標準                      | 驗證方式 |
| -------- | ------------------------- | -------- |
| 狀態分組 | 進行中/待啟動/已完成 三組 | 視覺確認 |
| 雙擊開頁 | 雙擊專案卡片開 Tab        | 交互測試 |
| 專案頁   | 顯示產出物/素材/專案筆記  | 視覺確認 |
| 狀態切換 | 下拉可切換狀態            | 交互測試 |

---

## Phase 6: 整合與驗證

### 確認點

- [ ] 6.1 全域快捷鍵測試（Ctrl+1~4）
- [ ] 6.2 Tab 關閉邏輯（含未保存確認）
- [ ] 6.3 資料刷新按鈕功能
- [ ] 6.4 跨模塊流程測試

### 審查標準

| 項目     | 標準                       | 驗證方式 |
| -------- | -------------------------- | -------- |
| 快捷鍵   | Ctrl+1~4 切換視圖          | 交互測試 |
| Tab 關閉 | 有變更時彈確認             | 交互測試 |
| 刷新     | Feed 刷新按鈕可用          | 交互測試 |
| 端到端   | Feed→保存→Library→加入專案 | 流程測試 |

---

## 最終驗收標準

| 類別     | 標準                       | 必須通過 |
| -------- | -------------------------- | -------- |
| **編譯** | `npm run dev` 無錯誤       | ✅        |
| **類型** | `npm run typecheck` 無錯誤 | ✅        |
| **功能** | 所有 Phase 審查標準通過    | ✅        |
| **效能** | 1000 條項目滾動 60fps      | ✅        |
| **架構** | 符合 design.md 規範        | ✅        |
