# Change: Unify Error Handling - 統一錯誤處理機制

## Why

目前錯誤處理方式不一致：
- 部分使用 `console.error` 靜默處理
- 部分使用 `useToastStore.addToast()` 但訊息不統一
- 部分直接 throw 未捕獲

這導致用戶無法得知操作是否失敗，且開發者難以追蹤問題。

## What Changes

- 建立 `AppError` 自定義錯誤類別，支援 `code` 與 `userMessage`
- 強化 `invokeIPC` 工具函數，提供統一的錯誤處理 pattern
- 抽取重複的資料轉換邏輯（日期格式化、tags 解析）為共用 utilities
- 確保所有用戶操作都有可見的反饋

## Impact

- Affected specs: `core`, `ui`
- Affected code:
  - `src/renderer/src/utils/ipc.ts`
  - `src/renderer/src/utils/transform.ts` (NEW)
  - `src/renderer/src/modules/feed/store/slices/items.slice.ts`
  - `src/renderer/src/modules/library/store/library.store.ts`
