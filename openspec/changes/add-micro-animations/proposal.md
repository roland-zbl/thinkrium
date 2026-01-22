# Change: Add Micro Animations - 加入微動畫

## Why

整體應用動畫較少，UI 缺乏「活力」，感覺較為生硬。

## What Changes

- 頁面/視圖切換淡入淡出效果
- 列表項目進場 staggered fade-in 動畫
- Toast 彈出/消失動畫優化
- 在 Tailwind 配置中定義可重用的 keyframes

## Impact

- Affected specs: `ui`
- Affected code:
  - `tailwind.config.js`
  - `src/renderer/src/index.css`
  - `src/renderer/src/components/layout/MainContent.tsx`
  - `src/renderer/src/modules/feed/components/FeedItemList.tsx`
  - `src/renderer/src/components/ui/Toast.tsx`
