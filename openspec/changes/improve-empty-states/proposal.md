# Change: Improve Empty States - 改進空狀態設計

## Why

EmptyState.tsx 視覺設計單調，缺乏引導。新用戶不知道該如何開始使用應用程式。

## What Changes

- 重新設計 EmptyState 元件，支援圖標、標題、描述、CTA 按鈕
- 為 Feed、Library、Project 各模組提供專屬空狀態配置
- 區分「無資料」與「無搜尋結果」場景

## Impact

- Affected specs: `ui`
- Affected code:
  - `src/renderer/src/components/ui/EmptyState.tsx`
  - `src/renderer/src/modules/feed/components/FeedItemList.tsx`
  - `src/renderer/src/modules/library/LibraryView.tsx`
  - `src/renderer/src/modules/project/components/ProjectList.tsx`
