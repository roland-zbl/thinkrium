# Change: Apply Virtual List - 應用虛擬列表

## Why

專案已引入 `@tanstack/react-virtual`，但 FeedItemList 尚未使用虛擬列表渲染。大量項目時（>500）可能導致效能問題。

## What Changes

- 將 FeedItemList 改為使用 @tanstack/react-virtual 虛擬渲染
- 確保鍵盤導航（J/K）仍正常運作
- 確保 scroll-to-item 功能正常

## Impact

- Affected specs: `feed`
- Affected code:
  - `src/renderer/src/modules/feed/components/FeedItemList.tsx`
