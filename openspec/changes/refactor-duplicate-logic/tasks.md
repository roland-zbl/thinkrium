## 1. Create Utilities

- [ ] 1.1 建立 `src/renderer/src/utils/transform.ts`：
  ```typescript
  export function parseTags(tags: string | string[] | undefined): string[]
  export function formatNoteDate(date: string | undefined): string
  export function parseDbNote(raw: DbNote): Note
  export function parseDbFeedItem(raw: DbFeedItem, subscriptions: Subscription[]): FeedItem
  ```
- [ ] 1.2 為每個函數編寫 JSDoc 註釋

## 2. Refactor Library Store

- [ ] 2.1 更新 `library.store.ts` 的 `fetchNotes()`：
  - 使用 `parseDbNote()` 替代內聯轉換邏輯
- [ ] 2.2 更新 `library.store.ts` 的 `fetchNote()`：
  - 使用 `parseDbNote()` 替代內聯轉換邏輯
- [ ] 2.3 移除 `library.store.ts` 中重複的 IIFE

## 3. Refactor Feed Store

- [ ] 3.1 更新 `items.slice.ts` 的 `fetchItems()`：
  - 使用 `parseDbFeedItem()` 替代內聯轉換邏輯
- [ ] 3.2 驗證 `stripHtml` 和 `extractFirstImage` 是否已抽取

## 4. Verification

- [ ] 4.1 執行 `npm run typecheck` 確認無類型錯誤
- [ ] 4.2 執行 `npm run test` 驗證無回歸
- [ ] 4.3 手動測試 Library 和 Feed 模組確認功能正常
