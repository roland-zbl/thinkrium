# Change: Improve Loading UX - 優化載入體驗

## Why

目前 App.tsx 的載入畫面僅顯示一個簡單的 spinner，缺乏品牌感。資料載入時也沒有 Skeleton UI，用戶不清楚正在發生什麼。

## What Changes

- 建立品牌化 SplashScreen 元件（含 Logo + 載入動畫）
- 建立可重用的 Skeleton 元件
- 為 FeedItemList 加入載入時的 Skeleton placeholder
- 為 Library NoteList 加入載入時的 Skeleton placeholder

## Impact

- Affected specs: `ui`
- Affected code:
  - `src/renderer/src/App.tsx`
  - `src/renderer/src/components/SplashScreen.tsx` (NEW)
  - `src/renderer/src/components/ui/Skeleton.tsx` (NEW)
  - `src/renderer/src/modules/feed/components/FeedItemList.tsx`
