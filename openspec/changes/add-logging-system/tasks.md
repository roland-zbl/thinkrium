## 1. Setup

- [ ] 1.1 安裝 `electron-log` 套件：`npm install electron-log`
- [ ] 1.2 建立 `electron/utils/logger.ts`：
  - 配置日誌等級（info/warn/error）
  - 開發環境輸出至 console
  - 生產環境輸出至 `{userData}/logs/`
  - 設置日誌輪替（最大 5 個檔案，每個 10MB）

## 2. Integration - Main Process

- [ ] 2.1 更新 `electron/main.ts`：
  - 替換 `console.log('App ready')` 等語句
  - 添加應用程式生命週期日誌
- [ ] 2.2 更新 `electron/database.ts`：
  - 記錄資料庫初始化、migration 執行
  - 錯誤記錄包含 stack trace
- [ ] 2.3 更新 `electron/services/scheduler.service.ts`：
  - 記錄排程任務執行與結果

## 3. Integration - Services

- [ ] 3.1 更新 `electron/services/feed.service.ts`：
  - 記錄 Feed 抓取操作
  - 記錄抓取失敗原因
- [ ] 3.2 更新 `electron/services/note.service.ts`：
  - 記錄筆記保存/刪除操作
  - 記錄圖片下載狀態
- [ ] 3.3 更新 `electron/services/rss.service.ts`：
  - 記錄 RSS 解析錯誤

## 4. Verification

- [ ] 4.1 執行應用程式並驗證 console 輸出格式正確
- [ ] 4.2 驗證生產環境建置後日誌寫入檔案
- [ ] 4.3 模擬錯誤情境確認 stack trace 被記錄
