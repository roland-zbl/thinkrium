# Change: Refactor Duplicate Logic - 抽取重複邏輯

## Why

目前存在多處重複邏輯：
- 日期格式化邏輯在 `library.store.ts` 與 `items.slice.ts` 重複
- Tags 解析邏輯（JSON 字串 vs 陣列）在多處重複
- Note 資料轉換邏輯（DbNote → Note）在多處複製貼上

這增加了維護成本，且修改時容易遺漏某些位置。

## What Changes

- 建立 `src/renderer/src/utils/transform.ts` 統一資料轉換
- 重構 `library.store.ts` 使用共用 utilities
- 重構 `items.slice.ts` 使用共用 utilities
- 移除重複的 helper functions

## Impact

- Affected specs: `feed`, `note`
- Affected code:
  - `src/renderer/src/utils/transform.ts` (NEW)
  - `src/renderer/src/modules/library/store/library.store.ts`
  - `src/renderer/src/modules/feed/store/slices/items.slice.ts`

## Notes

此 change 與 `unify-error-handling` 有部分重疊（都涉及 transform.ts），建議合併執行或按順序執行。
