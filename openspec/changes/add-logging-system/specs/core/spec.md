## ADDED Requirements

### Requirement: Structured Logging

系統 SHALL 提供結構化的日誌系統。

#### Scenario: 日誌輸出配置

- **WHEN** 應用程式在開發環境運行
- **THEN** 日誌 SHALL 輸出至 console
- **AND** 日誌包含時間戳、等級、訊息

#### Scenario: 生產環境日誌持久化

- **WHEN** 應用程式在生產環境運行
- **THEN** 日誌 SHALL 寫入 `{userData}/logs/` 目錄
- **AND** 日誌檔案 SHALL 自動輪替（最大 5 個檔案）

#### Scenario: 錯誤日誌追蹤

- **WHEN** 應用程式發生錯誤
- **THEN** 錯誤日誌 SHALL 包含完整的 stack trace
- **AND** 錯誤日誌 SHALL 包含相關上下文資訊
