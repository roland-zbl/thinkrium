# Change: Add Logging System - 建立日誌系統

## Why

目前所有日誌使用 `console.log/error`，導致：
- 生產環境無法追蹤問題
- 用戶回報問題時缺乏調試資訊
- 無法區分日誌層級（info/warn/error）

## What Changes

- 整合 `electron-log` 套件
- 替換關鍵位置的 `console.log/error` 為 structured logging
- 配置日誌輸出（開發環境：console，生產環境：file）

## Impact

- Affected specs: `core`
- Affected code:
  - `electron/main.ts`
  - `electron/database.ts`
  - `electron/services/*.ts`
  - `package.json` (new dependency)
