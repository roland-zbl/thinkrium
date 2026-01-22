## ADDED Requirements

### Requirement: Application Error Types

系統 SHALL 提供結構化的錯誤類型定義。

#### Scenario: 自定義錯誤類別

- **WHEN** 應用程式發生錯誤
- **THEN** 錯誤 SHALL 包含 `code`（機器可讀）與 `userMessage`（用戶可讀）
- **AND** 錯誤可被序列化傳遞

### Requirement: Data Transform Utilities

系統 SHALL 提供統一的資料轉換工具函數。

#### Scenario: Note 資料轉換

- **WHEN** 從資料庫獲取 DbNote 資料
- **THEN** 使用 `parseDbNote()` 轉換為前端 Note 類型
- **AND** 日期格式化、tags 解析邏輯集中處理

---

## MODIFIED Requirements

### Requirement: IPC Bridge

系統 SHALL 提供安全的主進程與渲染進程通訊機制，並**統一錯誤處理**。

#### Scenario: Preload 腳本暴露 API

- **WHEN** 渲染進程需要存取系統資源
- **THEN** 通過 `contextBridge` 暴露安全的 API
- **AND** 不直接暴露 Node.js 或 Electron API

#### Scenario: IPC 請求回應

- **WHEN** 渲染進程調用 `window.api.methodName()`
- **THEN** 主進程處理請求並返回結果
- **AND** 錯誤被正確捕獲和傳遞

#### Scenario: IPC 錯誤處理

- **WHEN** IPC 請求失敗
- **THEN** 用戶操作 SHALL 顯示 Toast 通知
- **AND** 開發者可透過 `silent` 選項靜默處理
