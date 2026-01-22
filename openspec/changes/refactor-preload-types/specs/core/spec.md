## MODIFIED Requirements

### Requirement: IPC Bridge

系統 SHALL 提供安全且**類型安全**的主進程與渲染進程通訊機制。

#### Scenario: Preload 腳本暴露 API

- **WHEN** 渲染進程需要存取系統資源
- **THEN** 通過 `contextBridge` 暴露安全的 API
- **AND** 不直接暴露 Node.js 或 Electron API
- **AND** 所有 API 方法 SHALL 具有完整的 TypeScript 類型定義

#### Scenario: IPC 請求類型安全

- **WHEN** 開發者調用 `window.api.methodName(arg)`
- **THEN** IDE 提供參數類型的自動補全
- **AND** 編譯器在類型不匹配時報錯
