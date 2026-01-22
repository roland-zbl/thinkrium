## 1. Fix Invalid Date Display

- [ ] 1.1 In `FeedItemCard.tsx`, add date validation using `isValid` from date-fns
- [ ] 1.2 Display "未知日期" when date is invalid or missing
- [ ] 1.3 Ensure consistent date formatting across all feed item displays

## 2. Improve Icon Fetching

- [ ] 2.1 In `rss.service.ts`, enhance `validateFeed` to try multiple icon sources:
  - Primary: `feed.image.url`
  - Fallback 1: `${origin}/favicon.ico`
  - Fallback 2: Google Favicon API `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
- [ ] 2.2 Update `addFeed` in subscriptions slice to properly store the icon URL
- [ ] 2.3 Verify icons display correctly in sidebar and folder nodes

## 3. Testing

- [ ] 3.1 Test with feeds that have missing publication dates
- [ ] 3.2 Test with feeds that don't provide icons
- [ ] 3.3 Verify existing feeds still display correctly
