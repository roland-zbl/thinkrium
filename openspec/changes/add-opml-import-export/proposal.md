# Change: Add OPML Import/Export

## Why

OPML (Outline Processor Markup Language) 是 RSS 閱讀器之間的標準交換格式。所有主流 RSS 閱讀器（Feedly、Inoreader、Readwise Reader）都支援此功能。

缺少 OPML 支援會導致：
- 用戶無法從其他 RSS 閱讀器遷移訂閱
- 用戶無法備份訂閱清單
- 用戶無法分享訂閱集給他人

這是 RSS 閱讀器的**標準必備功能**。

## What Changes

### 1. OPML 匯入功能
- 新增匯入對話框，允許用戶選擇本地 OPML 檔案
- 解析 OPML 結構，提取訂閱 URL 和分類資訊
- 批次新增訂閱（跳過已存在的重複項目）
- 顯示匯入結果摘要

### 2. OPML 匯出功能
- 新增匯出按鈕，將當前訂閱清單生成 OPML 檔案
- 保留分類（folder）結構
- 允許用戶選擇儲存位置

### 3. 分類保留
- 匯入時根據 OPML `outline` 層級建立對應分類
- 匯出時將分類映射為 OPML folder 結構

## Impact

- **Affected Specs**: `feed`
- **Affected Code**:
    - `electron/services/opml.service.ts` (New)
    - `electron/ipc/feed.ipc.ts` (Add handlers)
    - `src/renderer/src/modules/feed/components/ImportExportDialog.tsx` (New)
    - `src/renderer/src/modules/feed/components/SubscriptionSidebar.tsx` (Add buttons)
    - `src/preload/index.ts` (Expose APIs)
