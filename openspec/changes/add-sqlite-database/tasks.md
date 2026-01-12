## 1. 依賴安裝

- [ ] 1.1 安裝 `better-sqlite3`
- [ ] 1.2 安裝 `@types/better-sqlite3`（TypeScript 類型）
- [ ] 1.3 確認 Electron 主進程可以正確載入原生模組

---

## 2. 資料庫連接管理

- [ ] 2.1 創建 `electron/database.ts`
- [ ] 2.2 實現 `initDatabase()` 函數
  - 確定資料庫文件路徑（`app.getPath('userData')/knowledge-base.db`）
  - 創建或打開資料庫連接
  - 執行 schema migration
- [ ] 2.3 實現 `getDatabase()` 函數（返回資料庫實例）
- [ ] 2.4 實現連接關閉邏輯

---

## 3. Schema 設計

- [ ] 3.1 創建 `electron/migrations/001_initial_schema.sql`
- [ ] 3.2 定義 `feeds` 表
  - id, type, url, title, icon_url, last_fetched, fetch_interval, created_at
- [ ] 3.3 定義 `feed_items` 表
  - id, feed_id, guid, title, url, content, author, published_at, fetched_at, status, read_at
  - 外鍵約束 (feed_id → feeds.id, ON DELETE CASCADE)
- [ ] 3.4 創建必要索引

---

## 4. 整合到應用啟動流程

- [ ] 4.1 修改 `electron/main.ts`
- [ ] 4.2 在 `app.whenReady()` 中調用 `initDatabase()`
- [ ] 4.3 在 `app.on('quit')` 中關閉資料庫連接

---

## 5. 驗證

- [ ] 5.1 運行 `npm run dev` 確認應用正常啟動
- [ ] 5.2 檢查 `%APPDATA%/knowledge-base-app/` 目錄
- [ ] 5.3 使用 DB Browser for SQLite 驗證表結構
