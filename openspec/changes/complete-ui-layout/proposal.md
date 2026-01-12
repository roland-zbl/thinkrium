# Change: 完成 UI 三欄佈局組件

## Why

根據 Phase 1 開發計劃 Task 2，目前 Feed 模組的基礎組件（`FeedPage`, `FeedHeader`, `FeedFilters`, `FeedList`, `FeedCard`）已經存在，但缺少整體應用的佈局結構：

- 缺少 `AppLayout.tsx` - 三欄佈局容器
- 缺少 `Sidebar.tsx` - 側邊欄導航
- 缺少 `AuxPanel.tsx` - 輔助面板

這些佈局組件是實現 prototype 視覺效果的必要基礎。

## What Changes

- **[NEW]** `src/components/layout/AppLayout.tsx` - 三欄佈局容器
- **[NEW]** `src/components/layout/Sidebar.tsx` - 側邊欄導航（含訂閱源列表）
- **[NEW]** `src/components/layout/AuxPanel.tsx` - 輔助面板（可選）
- **[MODIFY]** `src/App.tsx` - 整合佈局組件
- **[MODIFY]** `src/index.css` - 複製 prototype 的 CSS 變量和樣式

## Impact

- **Affected specs**: `ui`
- **Affected code**: 
  - `src/components/layout/` (新增目錄)
  - `src/App.tsx`
  - `src/index.css`
- **Breaking changes**: 無

## Success Criteria

- [ ] 應用啟動後顯示與 HTML prototype 一致的三欄式佈局
- [ ] 側邊欄導航項目可點擊切換 active 狀態
- [ ] 深色主題配色正確（背景 #0d0d0d，文字白色，強調色 #4fc3f7）
