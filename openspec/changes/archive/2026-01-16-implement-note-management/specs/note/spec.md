## ADDED Requirements

### Requirement: Note CRUD Operations

系統 SHALL 支援筆記的完整 CRUD 操作。

#### Scenario: 列表查詢

- **WHEN** 用戶請求筆記列表
- **THEN** 系統返回所有筆記的摘要資訊
- **AND** 按更新時間降序排列

#### Scenario: 單筆獲取

- **WHEN** 用戶請求特定筆記詳情
- **THEN** 系統返回筆記元數據和完整 Markdown 內容

#### Scenario: 更新筆記

- **WHEN** 用戶修改並保存筆記
- **THEN** 系統更新本地 Markdown 文件
- **AND** 更新資料庫索引記錄

#### Scenario: 刪除筆記

- **WHEN** 用戶刪除筆記
- **THEN** 系統移除 Markdown 文件
- **AND** 刪除關聯的附件目錄
- **AND** 從資料庫移除記錄

### Requirement: Note Markdown Rendering

系統 SHALL 能正確渲染筆記的 Markdown 內容。

#### Scenario: GFM 支援

- **WHEN** 筆記包含 GFM 語法（表格、任務列表、刪除線）
- **THEN** 正確渲染對應的 HTML 元素

#### Scenario: 本地圖片支援

- **WHEN** 筆記引用本地附件圖片
- **THEN** 系統將相對路徑轉換為 `file://` 絕對路徑
- **AND** 圖片正確顯示
