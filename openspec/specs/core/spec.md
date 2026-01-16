# Core 模組規格

## Purpose

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

### Requirement: Database Initialization

系統 SHALL 在應用程式啟動時自動初始化 SQLite 資料庫。

#### Scenario: 首次啟動

- **WHEN** 應用程式首次啟動
- **THEN** 在 `userData` 目錄創建 `knowledge-base.db` 文件
- **AND** 執行 schema migration 建立所有必要的表

#### Scenario: 後續啟動

- **WHEN** 應用程式再次啟動
- **THEN** 打開現有的資料庫文件
- **AND** 檢查並執行任何待處理的 migration

---

### Requirement: Feeds Table Schema

系統 SHALL 提供 `feeds` 表存儲訂閱源信息。

#### Scenario: 表結構

- **WHEN** 資料庫初始化完成
- **THEN** `feeds` 表包含以下欄位：
  - `id` (TEXT, PRIMARY KEY)
  - `type` (TEXT, NOT NULL) - 'rss' | 'rsshub'
  - `url` (TEXT, NOT NULL)
  - `title` (TEXT)
  - `icon_url` (TEXT)
  - `last_fetched` (DATETIME)
  - `fetch_interval` (INTEGER, DEFAULT 30)
  - `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

---

### Requirement: Feed Items Table Schema

系統 SHALL 提供 `feed_items` 表存儲內容項目。

#### Scenario: 表結構

- **WHEN** 資料庫初始化完成
- **THEN** `feed_items` 表包含以下欄位：
  - `id` (TEXT, PRIMARY KEY)
  - `feed_id` (TEXT, FOREIGN KEY → feeds.id, ON DELETE CASCADE)
  - `guid` (TEXT, UNIQUE)
  - `title` (TEXT, NOT NULL)
  - `url` (TEXT)
  - `content` (TEXT)
  - `author` (TEXT)
  - `published_at` (DATETIME)
  - `fetched_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
  - `status` (TEXT, DEFAULT 'unread')
  - `read_at` (DATETIME)

#### Scenario: 級聯刪除

- **WHEN** 刪除某個訂閱源
- **THEN** 該訂閱源關聯的所有 `feed_items` 記錄被自動刪除

### Requirement: Design Tokens System

The application SHALL use a centralized Design Tokens system for all visual values.

#### Scenario: Color tokens usage

- **WHEN** developer needs to use a color value
- **THEN** they SHALL reference tokens.colors.\* (e.g., primary, bgBase, textPrimary)
- **AND** hardcoded color values are forbidden

#### Scenario: Spacing tokens usage

- **WHEN** developer needs spacing values
- **THEN** they SHALL use tokens.spacing.\* (xs, sm, md, lg, xl)
- **AND** hardcoded pixel values are forbidden

#### Scenario: Theme change

- **WHEN** tokens.ts is modified
- **THEN** all components using tokens reflect the change
- **AND** no individual component needs modification

---

### Requirement: Component Layering

The application SHALL follow a strict component layering architecture.

#### Scenario: Layer hierarchy

- **WHEN** components are organized
- **THEN** Pages layer can import from Features layer
- **AND** Features layer can import from UI layer
- **AND** UI layer can import from Tokens only

#### Scenario: Forbidden imports

- **WHEN** UI layer component imports from Features or Pages
- **THEN** this is a violation of architecture rules
- **AND** code review SHALL reject such changes

---

### Requirement: Module Boundaries

The application SHALL enforce strict module boundaries.

#### Scenario: Private by default

- **WHEN** a component is created
- **THEN** it SHALL be placed in the module's private components/ directory
- **AND** only promoted to global when used by multiple modules

#### Scenario: Single entry point

- **WHEN** external code imports from a module
- **THEN** it SHALL only import from module's index.ts
- **AND** direct imports to internal files are forbidden

#### Scenario: No cross-module imports

- **WHEN** module A needs data from module B
- **THEN** it SHALL communicate through global Store or EventBus
- **AND** direct imports between modules are forbidden

---

### Requirement: State Management Layers

The application SHALL use a 4-layer state management approach.

#### Scenario: Global state scope

- **WHEN** state is needed across modules
- **THEN** it SHALL be placed in stores/app.store.ts
- **AND** includes view state, tabs, theme

#### Scenario: Module state scope

- **WHEN** state is module-specific
- **THEN** it SHALL be placed in modules/xxx/store/
- **AND** persists across view switches

#### Scenario: Component state scope

- **WHEN** state is UI-only (hover, expanded)
- **THEN** it SHALL use React useState
- **AND** not be stored in global or module stores

---

### Requirement: Extensibility Design

The application SHALL support easy module addition.

#### Scenario: Adding a new module

- **WHEN** developer needs to add a new module (e.g., Calendar)
- **THEN** they create src/modules/calendar/ directory
- **AND** export CalendarView from index.ts
- **AND** add navigation item to NAV_ITEMS
- **AND** add display:none block in MainContent.tsx
- **AND** add view type to ViewType union

#### Scenario: Core unchanged on new module

- **WHEN** new module is added following the process
- **THEN** AppShell core logic is NOT modified
- **AND** Sidebar core logic is NOT modified
- **AND** other modules are NOT modified

## 技術規範

### 技術棧

| 項目             | 選擇                          |
| ---------------- | ----------------------------- |
| Runtime          | Electron 39.x                 |
| Frontend         | React 19.x + TypeScript 5.9.x |
| Bundler          | Vite 7.x + electron-vite 5.x  |
| Database         | better-sqlite3                |
| State Management | Zustand                       |

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
