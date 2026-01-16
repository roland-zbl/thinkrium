# Feed 模組規格

## Purpose

Feed 模組是知識庫的**資訊輸入端**，負責從外部世界收集資訊（RSS、RSSHub），並通過 AI 過濾後交付給用戶。

---
## Requirements
### Requirement: RSS Feed Subscription

系統 SHALL 支援用戶新增、移除和管理 RSS 訂閱源。

#### Scenario: 新增 RSS 訂閱

- **WHEN** 用戶輸入有效的 RSS URL
- **THEN** 系統驗證 URL 並抓取 Feed 元數據
- **AND** 將訂閱源存入 `feeds` 表
- **AND** 訂閱源出現在側邊欄列表中

#### Scenario: 移除訂閱

- **WHEN** 用戶選擇刪除某個訂閱源
- **THEN** 從 `feeds` 表移除該記錄
- **AND** 關聯的 `feed_items` 記錄被級聯刪除

#### Scenario: 訂閱源列表顯示

- **WHEN** 應用程式啟動
- **THEN** 加載所有訂閱源並顯示在側邊欄

---

### Requirement: Feed Content Fetching

系統 SHALL 能夠抓取和解析 RSS Feed 內容。

#### Scenario: 手動刷新

- **WHEN** 用戶點擊刷新按鈕
- **THEN** 抓取選中訂閱源的最新內容
- **AND** 新內容存入 `feed_items` 表
- **AND** 使用 `guid` 去重，避免重複項目

#### Scenario: RSS 解析成功

- **WHEN** 抓取 `https://rsshub.app/bilibili/ranking/0/3`
- **THEN** 正確解析 title、link、pubDate、description
- **AND** 結果存入資料庫

#### Scenario: 抓取失敗處理

- **WHEN** RSS URL 無法訪問或格式錯誤
- **THEN** 顯示錯誤訊息給用戶
- **AND** 不影響其他訂閱源的正常運作

---

### Requirement: Feed Content Display

系統 SHALL 以卡片式列表展示 Feed 內容。

#### Scenario: 內容列表顯示

- **WHEN** 用戶選擇某個訂閱源
- **THEN** 主區域顯示該訂閱源的內容項目
- **AND** 每個項目顯示標題、來源、發布時間

#### Scenario: 卡片交互

- **WHEN** 用戶滑鼠懸停在卡片上
- **THEN** 卡片顯示 hover 狀態（邊框高亮）
- **WHEN** 用戶點擊卡片
- **THEN** 展開詳細內容或跳轉至原文

---

### Requirement: Content Filtering

系統 SHALL 支援按狀態和來源過濾內容。

#### Scenario: 狀態篩選

- **WHEN** 用戶點擊「未讀」篩選標籤
- **THEN** 僅顯示 `status = 'unread'` 的項目

#### Scenario: 來源篩選

- **WHEN** 用戶在側邊欄選擇特定訂閱源
- **THEN** 僅顯示該訂閱源的內容項目

---

### Requirement: Read Status Tracking

系統 SHALL 追蹤內容的閱讀狀態。

#### Scenario: 標記為已讀

- **WHEN** 用戶點擊某個未讀項目
- **THEN** 該項目的 `status` 更新為 `'read'`
- **AND** 項目視覺樣式變更（如透明度降低）

---

### Requirement: IPC Bridge

系統 SHALL 提供安全的主進程與渲染進程通訊機制。

#### Scenario: Feed API 暴露

- **WHEN** 渲染進程載入時
- **THEN** 透過 `window.api.feed` 提供資料庫操作方法
- **AND** 包含 `listFeeds`, `addFeed`, `removeFeed`, `listItems`, `markAsRead`

### Requirement: Feed IPC Handlers

系統 SHALL 在主進程中註冊處理 Feed 相關請求的 IPC 監聽器。

#### Scenario: 獲取訂閱源列表

- **WHEN** 渲染進程發送 `feed:list` 請求
- **THEN** 主進程從 SQLite 讀取所有 `feeds` 記錄並回傳

#### Scenario: 更新閱讀狀態

- **WHEN** 渲染進程發送 `feed:item:mark-read` 請求
- **THEN** 主進程更新 SQLite 中對應 `feed_items` 的 `status` 為 `'read'`

### Requirement: Feed Management
The system SHALL allow users to manage RSS subscriptions.

#### Scenario: Add new subscription
- **WHEN** user enters a valid RSS URL in the "Add Subscription" dialog
- **THEN** the system fetches the feed metadata
- **AND** adds it to the database
- **AND** immediately fetches the latest items

#### Scenario: Remove subscription
- **WHEN** user chooses to remove a subscription
- **THEN** the subscription and its items are removed from the database

### Requirement: Feed Reading
The system SHALL display feed items from the local database.

#### Scenario: View items
- **WHEN** user selects a subscription or "All"
- **THEN** the system displays a list of items sorted by date (newest first)
- **AND** indicates read/unread status

#### Scenario: Background Updates
- **WHEN** the application is running
- **THEN** the system automatically checks for updates for all feeds every 15 minutes

### Requirement: Feed Layout

The Feed SHALL display a three-column layout with resizable panels.

#### Scenario: Three column structure

- **WHEN** user navigates to Feed
- **THEN** left column shows Subscription Sidebar (200px, collapsible)
- **AND** middle column shows Feed Item List (flex width)
- **AND** right column shows Preview Panel (400px, initially collapsed)

#### Scenario: Column resizing

- **WHEN** user drags panel handles
- **THEN** columns resize accordingly
- **AND** respects minimum widths

---

### Requirement: Feed Subscription Sidebar

The Feed SHALL provide a subscription management sidebar.

#### Scenario: Subscription groups

- **WHEN** user views subscription sidebar
- **THEN** subscriptions are grouped by category
- **AND** clicking a subscription filters the item list

#### Scenario: All items view

- **WHEN** user clicks "全部" at top
- **THEN** item list shows all items from all subscriptions

#### Scenario: Add subscription

- **WHEN** user clicks "+ 新增訂閱"
- **THEN** Add Subscription Dialog opens

---

### Requirement: Add Subscription Dialog

The Add Subscription Dialog SHALL collect subscription information.

#### Scenario: Dialog fields

- **WHEN** dialog is opened
- **THEN** displays RSS URL field (required)
- **AND** displays Name field (optional, auto-filled from feed)
- **AND** displays Category dropdown (optional, default "未分類")

#### Scenario: URL validation

- **WHEN** user enters URL and submits
- **THEN** system validates URL format
- **AND** fetches feed to auto-fill name if empty

---

### Requirement: Feed Item List

The Feed item list SHALL support virtual scrolling and status display.

#### Scenario: Virtual scrolling

- **WHEN** list contains 1000+ items
- **THEN** scrolling maintains 60fps
- **AND** only visible items are rendered

#### Scenario: Filter tabs

- **WHEN** user views item list
- **THEN** filter tabs show "全部", "未讀", "已保存"

---

### Requirement: Feed Item Status Visual

Feed items SHALL display visual indicators based on status.

#### Scenario: Unread item visual

- **WHEN** item is unread
- **THEN** left border shows 4px primary color
- **AND** title is font-semibold

#### Scenario: Read item visual

- **WHEN** item is read
- **THEN** no left border
- **AND** title is font-normal with opacity-70

#### Scenario: Selected item visual

- **WHEN** item is selected
- **THEN** background is bg-muted
- **AND** right border shows 2px primary color

---

### Requirement: Project Selector Popover

The Project Selector Popover SHALL allow quick project selection.

#### Scenario: Popover content

- **WHEN** popover is triggered (by drag or button click)
- **THEN** shows search input at top
- **AND** shows list of active and pending projects
- **AND** shows "+ 新增專案" button at bottom

#### Scenario: Search filtering

- **WHEN** user types in search input
- **THEN** project list filters in real-time

#### Scenario: Project selection

- **WHEN** user clicks a project
- **THEN** action is performed (save + add to project)
- **AND** popover closes

#### Scenario: Create new project

- **WHEN** user clicks "+ 新增專案"
- **THEN** Add Project Dialog opens
- **AND** after creation, item is added to new project

---

### Requirement: Feed Preview Panel

The Feed preview SHALL include quick note feature.

#### Scenario: Quick note input

- **WHEN** preview is open
- **THEN** shows "速記" text area at bottom
- **AND** user can type notes

#### Scenario: Save with quick note

- **WHEN** user clicks "保存為筆記" with text in quick note
- **THEN** note is saved with quick note content appended

## 數據模型

### feeds 表

```sql
CREATE TABLE feeds (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,            -- 'rss' | 'rsshub'
  url TEXT NOT NULL,
  title TEXT,
  icon_url TEXT,
  last_fetched DATETIME,
  fetch_interval INTEGER DEFAULT 30,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### feed_items 表

```sql
CREATE TABLE feed_items (
  id TEXT PRIMARY KEY,
  feed_id TEXT REFERENCES feeds(id) ON DELETE CASCADE,
  guid TEXT UNIQUE,
  title TEXT NOT NULL,
  url TEXT,
  content TEXT,
  author TEXT,
  published_at DATETIME,
  fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'unread',  -- 'unread' | 'read' | 'saved'
  read_at DATETIME
);
```

---

## IPC API

```typescript
interface FeedAPI {
  // 訂閱源管理
  addFeed(url: string): Promise<Feed>
  removeFeed(feedId: string): Promise<void>
  listFeeds(): Promise<Feed[]>

  // 內容管理
  fetchFeed(feedId: string): Promise<FeedItem[]>
  listItems(feedId?: string, filter?: ItemFilter): Promise<FeedItem[]>
  markAsRead(itemId: string): Promise<void>
}
```

---

## UI 組件

| 組件          | 職責                |
| ------------- | ------------------- |
| `FeedPage`    | Feed 模組的頁面容器 |
| `FeedHeader`  | 頁面標題和操作按鈕  |
| `FeedFilters` | 狀態和來源篩選標籤  |
| `FeedList`    | 內容項目列表容器    |
| `FeedCard`    | 單個內容項目卡片    |

---

## 技術規範

### 依賴

| 套件             | 用途               |
| ---------------- | ------------------ |
| `rss-parser`     | RSS/Atom Feed 解析 |
| `better-sqlite3` | SQLite 資料庫存取  |
| `zustand`        | 狀態管理           |
