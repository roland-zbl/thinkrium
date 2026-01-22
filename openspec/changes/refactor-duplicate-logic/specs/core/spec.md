## ADDED Requirements

### Requirement: Data Transform Utilities

系統 SHALL 提供統一的資料轉換工具模組。

#### Scenario: Note 資料轉換

- **WHEN** 從資料庫獲取 DbNote 資料
- **THEN** 使用 `parseDbNote()` 轉換為前端 Note 類型
- **AND** 日期格式化使用 `date-fns` 處理
- **AND** tags 解析支援 JSON 字串與陣列

#### Scenario: FeedItem 資料轉換

- **WHEN** 從資料庫獲取 FeedItem 資料
- **THEN** 使用 `parseDbFeedItem()` 轉換為前端格式
- **AND** 提取摘要（前 150 字元）
- **AND** 提取第一張圖片作為縮圖

#### Scenario: Tags 解析容錯

- **WHEN** tags 欄位為 JSON 字串
- **THEN** 解析為 string[]
- **WHEN** 解析失敗
- **THEN** 返回空陣列
