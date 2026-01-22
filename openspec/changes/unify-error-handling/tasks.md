## 1. Foundation

- [ ] 1.1 建立 `src/renderer/src/utils/errors.ts`：
  - 定義 `AppError` 類別，包含 `code`, `message`, `userMessage` 屬性
  - 定義常見錯誤碼（`NETWORK_ERROR`, `DB_ERROR`, `VALIDATION_ERROR`）
- [ ] 1.2 強化 `src/renderer/src/utils/ipc.ts`：
  - 支援 `silent` 選項完全靜默
  - 支援自定義錯誤訊息 `errorMessage`
  - 記錄錯誤至 console（為日後 logger 準備）

## 2. Utilities

- [ ] 2.1 建立 `src/renderer/src/utils/transform.ts`：
  - `parseDbNote(raw: DbNote): Note` - 統一 Note 轉換邏輯
  - `parseTags(tags: string | string[] | undefined): string[]`
  - `formatNoteDate(date: string | undefined): string`
- [ ] 2.2 重構 `library.store.ts` 以使用 `transform.ts` 函數
- [ ] 2.3 重構 `items.slice.ts` 以使用 `transform.ts` 函數

## 3. Error Handling Consistency

- [ ] 3.1 統一 `items.slice.ts` 錯誤處理：
  - 區分「靜默操作」（自動標記已讀）與「用戶操作」（保存筆記）
  - 用戶操作 SHALL 顯示具體錯誤訊息
- [ ] 3.2 統一 `library.store.ts` 錯誤處理
- [ ] 3.3 統一 `project.store.ts` 錯誤處理

## 4. Verification

- [ ] 4.1 執行 `npm run typecheck` 確認無類型錯誤
- [ ] 4.2 手動測試錯誤場景（斷網、無效輸入）確認 Toast 正確顯示
- [ ] 4.3 執行現有測試確認無回歸
