## MODIFIED Requirements

### Requirement: IPC Bridge

系統 SHALL 提供安全的主進程與渲染進程通訊機制。

#### Scenario: Feed API 暴露

- **WHEN** 渲染進程載入時
- **THEN** 透過 `window.api.feed` 提供資料庫操作方法
- **AND** 包含 `listFeeds`, `addFeed`, `removeFeed`, `listItems`, `markAsRead`

---

## ADDED Requirements

### Requirement: Feed IPC Handlers

系統 SHALL 在主進程中註冊處理 Feed 相關請求的 IPC 監聽器。

#### Scenario: 獲取訂閱源列表

- **WHEN** 渲染進程發送 `feed:list` 請求
- **THEN** 主進程從 SQLite 讀取所有 `feeds` 記錄並回傳

#### Scenario: 更新閱讀狀態

- **WHEN** 渲染進程發送 `feed:item:mark-read` 請求
- **THEN** 主進程更新 SQLite 中對應 `feed_items` 的 `status` 為 `'read'`
