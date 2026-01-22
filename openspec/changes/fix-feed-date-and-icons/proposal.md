# Change: Fix Feed Date Display and Icons

## Why

Feed items currently show "Invalid Date" instead of the publication date, and subscription source icons are not displaying correctly. These bugs significantly impact user experience in the core Feed module.

## What Changes

- Fix date parsing in `FeedItemCard.tsx` to handle invalid/missing dates gracefully
- Improve favicon fetching logic in `rss.service.ts` with multiple fallback strategies
- Display friendly fallback text ("未知日期") instead of "Invalid Date"

## Impact

- Affected specs: feed
- Affected code:
  - `src/renderer/src/modules/feed/components/FeedItemCard.tsx`
  - `electron/services/rss.service.ts`
