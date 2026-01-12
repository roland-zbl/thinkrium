# Core 模組規格

## 概述

Core 模組提供知識庫應用的共用基礎設施，包括 Electron 主進程服務、IPC 通訊、資料庫管理和設定系統。

---

## Requirements

### Requirement: Electron Application Shell

系統 SHALL 提供一個基於 Electron 的桌面應用程式框架。

#### Scenario: 應用程式啟動
- **WHEN** 使用者啟動應用程式
- **THEN** 顯示主視窗，載入 React 渲染進程
- **AND** 視窗標題顯示應用程式名稱

#### Scenario: 開發模式熱重載
- **WHEN** 開發者修改 React 組件
- **THEN** 應用程式自動重新載入並反映變更

---

### Requirement: IPC Bridge

系統 SHALL 提供安全的主進程與渲染進程通訊機制。

#### Scenario: Preload 腳本暴露 API
- **WHEN** 渲染進程需要存取系統資源
- **THEN** 通過 `contextBridge` 暴露安全的 API
- **AND** 不直接暴露 Node.js 或 Electron API

#### Scenario: IPC 請求回應
- **WHEN** 渲染進程調用 `window.api.methodName()`
- **THEN** 主進程處理請求並返回結果
- **AND** 錯誤被正確捕獲和傳遞

---

### Requirement: SQLite Database

系統 SHALL 使用 SQLite 作為本地資料存儲。

#### Scenario: 資料庫初始化
- **WHEN** 應用程式首次啟動
- **THEN** 在使用者數據目錄創建 `knowledge-base.db` 文件
- **AND** 執行 schema migration 建立必要的表

#### Scenario: 資料庫表結構
- **WHEN** 資料庫初始化完成
- **THEN** 存在 `feeds` 表（訂閱源）
- **AND** 存在 `feed_items` 表（內容項目）

---

### Requirement: Event Bus

系統 SHALL 提供跨模組事件通訊機制。

#### Scenario: 事件發布與訂閱
- **WHEN** 模組 A 發布事件 `'feed:item-fetched'`
- **THEN** 已訂閱該事件的模組 B 收到通知
- **AND** 事件攜帶正確的 payload 數據

---

## 技術規範

### 技術棧

| 項目 | 選擇 |
|------|------|
| Runtime | Electron 39.x |
| Frontend | React 19.x + TypeScript 5.9.x |
| Bundler | Vite 7.x + electron-vite 5.x |
| Database | better-sqlite3 |
| State Management | Zustand |

### 目錄結構

```
electron/
├── main.ts              # 主進程入口
├── preload.ts           # Preload 腳本
├── database.ts          # SQLite 連接管理
└── ipc/                 # IPC 處理器
    ├── index.ts
    └── feed.ipc.ts

src/
├── core/
│   ├── event-bus/       # 事件總線
│   └── config/          # 設定管理
└── modules/             # 功能模組
```
