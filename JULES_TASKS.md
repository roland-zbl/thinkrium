# Thinkrium 技術債清理任務

> 根據 2026-01-22 Code Review 結果整理
> 適用於 Jules AI 自動執行

---

## 🎯 執行順序建議

```
Phase 1: 基礎設施（建議先執行）
├── 1. refactor-preload-types     [1.5h] - Type Safety
├── 2. refactor-duplicate-logic   [1.5h] - 抽取重複邏輯
├── 3. unify-error-handling       [2h]   - 統一錯誤處理
└── 4. add-logging-system         [1h]   - 日誌系統

Phase 2: 功能開發（基礎完成後）
└── ... 新功能開發 ...
```

---

## 📋 Phase 1: 基礎設施修復

### Task 1: Refactor Preload Types

**OpenSpec**: `openspec/changes/refactor-preload-types/`

**背景**：`electron/preload.ts` 中約 15 處使用 `any` 類型，導致 IDE 自動補全失效。

**目標**：
1. 將所有 `any` 替換為 `@shared/types` 的具體類型
2. 更新 `env.d.ts` 中的 API 類型聲明

**涉及檔案**：
- `electron/preload.ts`
- `src/renderer/src/env.d.ts`

**驗收標準**：
- [ ] 執行 `npm run typecheck` 無錯誤
- [ ] IDE 中 `window.api.*` 自動補全正常

---

### Task 2: Refactor Duplicate Logic

**OpenSpec**: `openspec/changes/refactor-duplicate-logic/`

**背景**：日期格式化、tags 解析邏輯在多處重複。

**目標**：
1. 建立 `src/renderer/src/utils/transform.ts`
2. 實作 `parseTags()`, `formatNoteDate()`, `parseDbNote()`
3. 重構 `library.store.ts` 與 `items.slice.ts`

**涉及檔案**：
- `src/renderer/src/utils/transform.ts` (NEW)
- `src/renderer/src/modules/library/store/library.store.ts`
- `src/renderer/src/modules/feed/store/slices/items.slice.ts`

**驗收標準**：
- [ ] 無重複的資料轉換邏輯
- [ ] 所有測試通過

---

### Task 3: Unify Error Handling

**OpenSpec**: `openspec/changes/unify-error-handling/`

**背景**：錯誤處理方式不一致（console.error / Toast / throw）。

**目標**：
1. 建立 `AppError` 自定義錯誤類別
2. 強化 `invokeIPC` 工具函數
3. 統一所有 store 的錯誤處理

**涉及檔案**：
- `src/renderer/src/utils/errors.ts` (NEW)
- `src/renderer/src/utils/ipc.ts`
- `src/renderer/src/modules/feed/store/slices/items.slice.ts`
- `src/renderer/src/modules/library/store/library.store.ts`
- `src/renderer/src/modules/project/store/project.store.ts`

**驗收標準**：
- [ ] 用戶操作失敗時顯示具體錯誤訊息
- [ ] 開發者可透過 `silent` 選項靜默處理

---

### Task 4: Add Logging System

**OpenSpec**: `openspec/changes/add-logging-system/`

**背景**：目前使用 `console.log/error`，無法追蹤生產問題。

**目標**：
1. 安裝 `electron-log` 套件
2. 建立 `electron/utils/logger.ts`
3. 替換關鍵位置的 console 調用

**涉及檔案**：
- `package.json` (new dependency)
- `electron/utils/logger.ts` (NEW)
- `electron/main.ts`
- `electron/database.ts`
- `electron/services/*.ts`

**驗收標準**：
- [ ] 開發環境日誌輸出至 console
- [ ] 生產環境日誌寫入 `{userData}/logs/`
- [ ] 錯誤日誌包含 stack trace

---

## 🔗 相關資源

- **Repository**: https://github.com/roland-zbl/thinkrium
- **Code Review Report**: `thinkrium_code_review.md`
- **OpenSpec 指南**: `openspec/AGENTS.md`

---

## 📝 執行說明

每個 Task 對應一個 OpenSpec change，Jules 可使用以下指令：

```bash
# 檢視 change 詳情
openspec show refactor-preload-types

# 驗證 change 格式
openspec validate refactor-preload-types --strict

# 完成後歸檔
openspec archive refactor-preload-types --yes
```
