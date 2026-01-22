# Change: Unify Visual Feedback - 統一視覺回饋

## Why

hover/focus 狀態在部分元件不明顯或不一致，影響使用者對可互動元素的感知。

## What Changes

- 在 index.css 定義統一的 focus ring 樣式
- 確保所有按鈕、卡片、列表項目具有一致的 hover 過渡效果
- 統一使用 Tailwind transition utilities

## Impact

- Affected specs: `ui`
- Affected code:
  - `src/renderer/src/index.css`
  - `src/renderer/src/components/ui/button.tsx`
  - `src/renderer/src/modules/feed/components/FeedItemCard.tsx`
  - `src/renderer/src/modules/feed/components/FolderNode.tsx`
