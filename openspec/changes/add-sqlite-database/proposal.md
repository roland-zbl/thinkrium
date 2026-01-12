# Change: 新增 SQLite 資料庫初始化

## Why

根據 Phase 1 開發計劃 Task 3，需要在 Electron 主進程中設置 SQLite 資料庫，作為 Feed 內容和訂閱源的持久化存儲。

目前應用程式使用模擬數據，需要建立真正的資料庫層以支援：
- 訂閱源的新增、刪除和列表查詢
- Feed 內容項目的存儲和檢索
- 閱讀狀態追蹤

## What Changes

- **[NEW]** 安裝 `better-sqlite3` 依賴
- **[NEW]** `electron/database.ts` - SQLite 連接管理和初始化
- **[NEW]** `electron/migrations/001_initial_schema.sql` - 初始 schema
- **[MODIFY]** `electron/main.ts` - 在應用啟動時初始化資料庫

## Impact

- **Affected specs**: `core`, `feed`
- **Affected code**: 
  - `electron/database.ts` (新增)
  - `electron/migrations/` (新增目錄)
  - `electron/main.ts`
  - `package.json`
- **Breaking changes**: 無

## Success Criteria

- [ ] 應用啟動後在 `userData` 目錄生成 `knowledge-base.db` 文件
- [ ] 使用 SQLite 工具可以看到 `feeds` 和 `feed_items` 表
- [ ] Schema 包含正確的欄位和約束
