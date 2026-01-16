## ADDED Requirements

### Requirement: AppLayout Component

系統 SHALL 提供 AppLayout 組件作為三欄佈局容器。

#### Scenario: 基本佈局渲染

- **WHEN** AppLayout 組件被渲染
- **THEN** 顯示三欄結構：Sidebar（左）、主內容區（中）、AuxPanel（右）
- **AND** 使用 flexbox 佈局，主內容區彈性填充

---

### Requirement: Sidebar Component

系統 SHALL 提供 Sidebar 組件作為側邊欄導航。

#### Scenario: 導航項目渲染

- **WHEN** Sidebar 組件被渲染
- **THEN** 顯示主導航項目（首頁、Feed 等）
- **AND** 每個項目有圖標和文字

#### Scenario: Active 狀態

- **WHEN** 用戶點擊某導航項目
- **THEN** 該項目顯示 active 樣式（背景高亮）
- **AND** 其他項目恢復預設樣式

---

### Requirement: AuxPanel Component

系統 SHALL 提供 AuxPanel 組件作為輔助面板。

#### Scenario: 基本渲染

- **WHEN** AuxPanel 組件被渲染
- **THEN** 顯示在主內容區右側
- **AND** 寬度固定為 300px
