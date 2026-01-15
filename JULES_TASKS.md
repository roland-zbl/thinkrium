# Thinkrium 技術債清理任務

> 根據 2026-01-15 Code Review 結果整理
> 適用於 Jules AI 自動執行

---

## 🔴 高優先任務

### Task 1: 建立全局錯誤處理與 Toast 系統

**背景**：目前有 17 處錯誤僅使用 `console.error`，用戶無法得知操作失敗。

**目標**：
1. 創建 `src/renderer/src/components/ui/Toast.tsx` 元件
2. 創建 `src/renderer/src/stores/toast.store.ts` Zustand store
3. 在 `AppShell.tsx` 中整合 Toast 渲染
4. 重構所有 `console.error` 調用點，改為觸發 Toast 通知

**涉及檔案**：
- `src/renderer/src/modules/project/store/project.store.ts` (3 處)
- `src/renderer/src/modules/note/components/NoteEditor.tsx` (2 處)
- `src/renderer/src/modules/library/store/library.store.ts` (1 處)
- `src/renderer/src/modules/feed/store/feed.store.ts` (6 處)
- `src/renderer/src/modules/feed/components/AddSubscriptionDialog.tsx` (1 處)
- `src/renderer/src/components/SetupDialog.tsx` (2 處)
- `src/renderer/src/components/layout/AppShell.tsx` (2 處)

**驗收標準**：
- [ ] Toast 元件支援 success/error/warning/info 類型
- [ ] Toast 可自動消失（3 秒後）
- [ ] 所有錯誤處理點都有用戶可見的反饋

---

### Task 2: 修復生產環境安全隱患

**背景**：`webSecurity: false` 在 `electron/main.ts` 中被無條件啟用。

**目標**：
1. 將 `webSecurity: false` 改為僅在開發環境啟用
2. 添加適當的 CSP (Content-Security-Policy)

**涉及檔案**：
- `electron/main.ts`
- `src/index.html`

**參考修改**：
```typescript
// electron/main.ts
webPreferences: {
  webSecurity: !is.dev, // 僅開發環境關閉
  // ...
}
```

**驗收標準**：
- [ ] 開發環境保持現有行為
- [ ] 生產環境 `webSecurity` 為 `true`
- [ ] CSP 允許必要的外部資源（fonts.googleapis.com）

---

### Task 3: 建立核心服務單元測試

**背景**：目前僅有 1 個測試檔案，覆蓋率 < 5%。

**目標**：為後端服務建立單元測試。

**新增測試檔案**：
1. `electron/__tests__/note.service.test.ts`
2. `electron/__tests__/project.service.test.ts`
3. `electron/__tests__/feed.service.test.ts`
4. `electron/__tests__/database.test.ts`

**驗收標準**：
- [ ] 每個服務至少 3 個測試案例
- [ ] 測試覆蓋 CRUD 操作
- [ ] Mock `better-sqlite3` 以隔離測試

---

## 🟡 中優先任務

### Task 4: 消除 `any` 型別

**背景**：10 處使用 `any` 影響型別安全。

**涉及檔案與位置**：
| 檔案 | 行號 | 原始 | 建議 |
|------|------|------|------|
| `NoteTable.tsx` | 63 | `note: any` | 使用 `Note` 型別 |
| `project.store.ts` | 37 | `p: any` | 創建 `DbProject` 型別 |
| `AddSubscriptionDialog.tsx` | 31 | `err: any` | 使用 `Error` 或 `unknown` |
| `env.d.ts` | 多處 | API 定義 | 創建共用型別定義 |
| `AppShell.tsx` | 132 | `event: any` | 使用 `DragStartEvent` |

**驗收標準**：
- [ ] 所有 `any` 被替換為具體型別
- [ ] 創建 `src/renderer/src/types/` 共用型別目錄

---

### Task 5: 處理未完成的 TODO

**背景**：7 個未處理的 TODO 標記。

| 檔案 | 行號 | TODO 內容 | 建議行動 |
|------|------|-----------|----------|
| `project.store.ts` | 22 | Implement backend update | 實作 `updateProjectStatus` IPC |
| `project.store.ts` | 48 | DB lacks notes column | 添加 migration |
| `NoteEditor.tsx` | 24 | Handle error state in UI | 使用 Toast 系統 |
| `NoteEditor.tsx` | 47 | Add user feedback | 使用 Toast 系統 |
| `feed.store.ts` | 61 | DB schema 需支援分類 | 添加 migration |
| `feed.store.ts` | 128 | Fetch icon | 實作 favicon 抓取 |
| `TabBar.tsx` | 70 | 實際保存邏輯 | 實作 tab 持久化 |

**驗收標準**：
- [ ] 每個 TODO 被移除或轉為 Issue
- [ ] 關鍵功能被實作

---

## 🟢 低優先任務

### Task 6: 重構共用服務

**背景**：`TurndownService` 在多處重複實例化。

**涉及檔案**：
- `electron/services/note.service.ts`
- `src/renderer/src/modules/feed/store/feed.store.ts`

**目標**：
1. 創建 `src/renderer/src/lib/turndown.ts` 共用實例
2. 統一配置

---

### Task 7: 命名一致性

**背景**：IPC 註冊函數命名不一致。

**現狀**：
- `registerProjectIpc`
- `registerNoteIpc`
- `registerFeedIpc`
- `registerSettingsIpc`

**目標**：統一為 `registerXxxIpc` 或 `initXxxIPC` 格式。

---

## 📋 執行順序建議

```
1. Task 2 (安全修復) - 0.5h
2. Task 1 (Toast 系統) - 2h
3. Task 4 (型別安全) - 2h
4. Task 3 (單元測試) - 4-8h
5. Task 5 (TODO 處理) - 2-4h
6. Task 6-7 (重構) - 1-2h
```

---

## 🔗 相關資源

- **Repository**: https://github.com/roland-zbl/thinkrium
- **Code Review Report**: `thinkrium_code_review.md`
- **Latest Commit**: 2ee6738
