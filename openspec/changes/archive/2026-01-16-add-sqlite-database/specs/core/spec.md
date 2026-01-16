## ADDED Requirements

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
