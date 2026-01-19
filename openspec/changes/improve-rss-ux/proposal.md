# Change: Improve RSS Reader UX

## Why

目前 RSS 模塊有兩個嚴重的用戶體驗問題：

1. **未讀過濾行為不佳**：在「未讀」標籤下點擊文章後，該文章立即從列表中消失，導致用戶失去閱讀上下文。競品（Feedly、Inoreader）通常採用延遲移除或提供開關。

2. **文章預覽可讀性差**：文章預覽區的排版未針對中文長文閱讀優化，行高、字體大小和段落間距影響閱讀體驗。

這些問題直接影響日常使用，屬於核心體驗缺陷，應優先修復。

## What Changes

### 1. 未讀過濾行為修正
- 已讀文章不應立即從「未讀」列表中消失
- 已讀文章改為灰顯（視覺區分），切換 tab 或刷新時才真正移除
- 新增「自動隱藏已讀」開關（選用功能，預設關閉）

### 2. 文章預覽 Typography 優化
- 調整正文字體為 Inter/思源黑體 優化堆疊
- 中文內文字號調整為 17-18px
- 行高調整為 1.8-2.0
- 段落間距調整為 1.5em
- 內容區最大寬度限制 (65ch)
- 改善程式碼區塊樣式

### 3. Quick Note 功能完善
- 實現 Quick Note 的保存邏輯
- 將筆記內容保存到對應的 Feed Item 或 Note 系統

## Impact

- **Affected Specs**: `feed`
- **Affected Code**:
    - `src/renderer/src/modules/feed/store/feed.store.ts` (狀態管理邏輯)
    - `src/renderer/src/modules/feed/components/FeedItemList.tsx` (過濾邏輯)
    - `src/renderer/src/modules/feed/components/FeedItemCard.tsx` (已讀視覺樣式)
    - `src/renderer/src/modules/feed/components/FeedPreview.tsx` (Typography + Quick Note)
    - `src/renderer/src/modules/feed/components/FilterTabs.tsx` (開關選項)
    - `tailwind.config.js` (字體設定)
